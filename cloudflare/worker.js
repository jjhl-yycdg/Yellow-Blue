// Cloudflare Worker for handling uploads to R2 and serving uploaded files.
// Bindings required when deploying:
// - R2 bucket binding named IMAGES
// - Optional environment variables: UPLOAD_KEY (simple auth), ORIGIN_BASE (your public origin for returned URLs)

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request){
  const url = new URL(request.url);
  // CORS preflight handling
  if(request.method === 'OPTIONS'){
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // POST /upload -> accept multipart form-data, field name 'file'
  if(request.method === 'POST' && url.pathname === '/upload'){
    // simple auth: check header x-upload-key if UPLOAD_KEY is set
    const provided = request.headers.get('x-upload-key') || '';
    if(typeof UPLOAD_KEY !== 'undefined' && UPLOAD_KEY && provided !== UPLOAD_KEY){
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: jsonCorsHeaders() });
    }

    // Must be multipart/form-data
    const ct = request.headers.get('content-type') || '';
    if(!ct.includes('multipart/form-data')){
      return new Response(JSON.stringify({ error: 'unsupported_content_type' }), { status: 400, headers: jsonCorsHeaders() });
    }

    try{
      const form = await request.formData();
      const file = form.get('file');
      if(!file){ return new Response(JSON.stringify({ error: 'no_file' }), { status: 400, headers: jsonCorsHeaders() }); }

      const filename = file.name || ('upload_' + Date.now());
      const safe = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const key = Date.now() + '_' + safe;

      const ab = await file.arrayBuffer();
      const meta = { httpMetadata: { contentType: file.type || 'application/octet-stream' } };
      // IMAGES is the R2 binding
      await IMAGES.put(key, ab, meta);

      // Construct public URL - recommend using ORIGIN_BASE configured to your domain or Pages domain
      const origin = (typeof ORIGIN_BASE !== 'undefined' && ORIGIN_BASE) ? ORIGIN_BASE.replace(/\/$/, '') : (new URL(request.url)).origin;
      const publicUrl = `${origin}/uploads/${encodeURIComponent(key)}`;
      return new Response(JSON.stringify({ url: publicUrl }), { status: 200, headers: jsonCorsHeaders() });
    }catch(err){
      return new Response(JSON.stringify({ error: 'upload_failed', detail: String(err) }), { status: 500, headers: jsonCorsHeaders() });
    }
  }

  // GET /uploads/<key> -> serve object from R2
  if(request.method === 'GET' && url.pathname.startsWith('/uploads/')){
    const key = decodeURIComponent(url.pathname.replace('/uploads/',''));
    try{
      const obj = await IMAGES.get(key);
      if(!obj) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: jsonCorsHeaders() });
      const headers = new Headers(jsonCorsHeaders());
      if(obj.httpMetadata && obj.httpMetadata.contentType) headers.set('content-type', obj.httpMetadata.contentType);
      // Caching headers - tune as needed
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return new Response(obj.body, { status: 200, headers });
    }catch(err){
      return new Response(JSON.stringify({ error: 'read_failed', detail: String(err) }), { status: 500, headers: jsonCorsHeaders() });
    }
  }

  // fallback: 404
  return new Response('Not found', { status: 404 });
}

function corsHeaders(){
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-upload-key'
  };
}

function jsonCorsHeaders(){
  return Object.assign({'Content-Type':'application/json'}, corsHeaders());
}
