if (typeof globalThis !== 'undefined') {
  globalThis.__filename = '';
  globalThis.__dirname = '';
}

import { Writable } from 'node:stream';
if (Writable && Writable.prototype && !Writable.prototype._write) {
  Writable.prototype._write = function(chunk, encoding, callback) {
    callback();
  };
}
// serverless-http does not implement _write which crashes nodejs_compat in Cloudflare
if (Writable && Writable.prototype) {
  const originalWrite = Writable.prototype.write;
  Writable.prototype._write = function(chunk, encoding, callback) {
    if (callback) callback();
  };
}
