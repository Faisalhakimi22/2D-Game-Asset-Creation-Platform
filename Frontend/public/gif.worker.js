// GIF Worker - handles GIF encoding in a separate thread
// This is a minimal implementation for gif.js library

(function() {
    'use strict';
    
    // NeuQuant Neural-Net Quantization Algorithm
    var NeuQuant = function(pixels, samplefac) {
        var netsize = 256;
        var prime1 = 499, prime2 = 491, prime3 = 487, prime4 = 503;
        var minpicturebytes = 3 * prime4;
        var network = [], netindex = new Int32Array(256);
        var bias = new Int32Array(netsize), freq = new Int32Array(netsize);
        
        function init() {
            for (var i = 0; i < netsize; i++) {
                var v = (i << 12) / netsize;
                network[i] = new Float64Array([v, v, v, 0]);
                freq[i] = (1 << 14) / netsize;
                bias[i] = 0;
            }
        }
        
        function unbiasnet() {
            for (var i = 0; i < netsize; i++) {
                network[i][0] >>= 4;
                network[i][1] >>= 4;
                network[i][2] >>= 4;
                network[i][3] = i;
            }
        }
        
        function inxbuild() {
            var previouscol = 0, startpos = 0;
            for (var i = 0; i < netsize; i++) {
                var p = network[i], smallpos = i, smallval = p[1];
                for (var j = i + 1; j < netsize; j++) {
                    var q = network[j];
                    if (q[1] < smallval) { smallpos = j; smallval = q[1]; }
                }
                var q = network[smallpos];
                if (i != smallpos) {
                    var j = q[0]; q[0] = p[0]; p[0] = j;
                    j = q[1]; q[1] = p[1]; p[1] = j;
                    j = q[2]; q[2] = p[2]; p[2] = j;
                    j = q[3]; q[3] = p[3]; p[3] = j;
                }
                if (smallval != previouscol) {
                    netindex[previouscol] = (startpos + i) >> 1;
                    for (j = previouscol + 1; j < smallval; j++) netindex[j] = i;
                    previouscol = smallval; startpos = i;
                }
            }
            netindex[previouscol] = (startpos + 255) >> 1;
            for (var j = previouscol + 1; j < 256; j++) netindex[j] = 255;
        }

        function learn() {
            var lengthcount = pixels.length;
            var samplepixels = lengthcount / (3 * samplefac);
            var delta = ~~(samplepixels / 100);
            var alpha = 1024, radius = 32 << 6;
            
            if (delta === 0) delta = 1;
            var step = lengthcount < minpicturebytes ? 3 : 
                       lengthcount % prime1 !== 0 ? 3 * prime1 :
                       lengthcount % prime2 !== 0 ? 3 * prime2 :
                       lengthcount % prime3 !== 0 ? 3 * prime3 : 3 * prime4;
            
            var pix = 0;
            for (var i = 0; i < samplepixels; ) {
                var b = (pixels[pix] & 0xff) << 4;
                var g = (pixels[pix + 1] & 0xff) << 4;
                var r = (pixels[pix + 2] & 0xff) << 4;
                
                var bestd = ~(1 << 31), bestbiasd = bestd, bestpos = -1, bestbiaspos = bestpos;
                for (var j = 0; j < netsize; j++) {
                    var n = network[j];
                    var dist = Math.abs(n[0] - b) + Math.abs(n[1] - g) + Math.abs(n[2] - r);
                    if (dist < bestd) { bestd = dist; bestpos = j; }
                    var biasdist = dist - (bias[j] >> 10);
                    if (biasdist < bestbiasd) { bestbiasd = biasdist; bestbiaspos = j; }
                    var betafreq = freq[j] >> 10;
                    freq[j] -= betafreq;
                    bias[j] += betafreq << 10;
                }
                freq[bestpos] += 64;
                bias[bestpos] -= 65536;
                
                var n = network[bestbiaspos];
                n[0] -= (alpha * (n[0] - b)) / 1024;
                n[1] -= (alpha * (n[1] - g)) / 1024;
                n[2] -= (alpha * (n[2] - r)) / 1024;
                
                pix += step;
                if (pix >= lengthcount) pix -= lengthcount;
                i++;
                if (i % delta === 0) {
                    alpha -= alpha / 30;
                    radius -= radius / 30;
                }
            }
        }
        
        this.buildColormap = function() { init(); learn(); unbiasnet(); inxbuild(); };
        
        this.getColormap = function() {
            var map = [], index = [];
            for (var i = 0; i < netsize; i++) index[network[i][3]] = i;
            var k = 0;
            for (var l = 0; l < netsize; l++) {
                var j = index[l];
                map[k++] = network[j][0];
                map[k++] = network[j][1];
                map[k++] = network[j][2];
            }
            return map;
        };
        
        this.lookupRGB = function(b, g, r) {
            var bestd = 1000, best = -1;
            var i = netindex[g], j = i - 1;
            while (i < netsize || j >= 0) {
                if (i < netsize) {
                    var p = network[i], dist = p[1] - g;
                    if (dist >= bestd) i = netsize;
                    else {
                        i++; if (dist < 0) dist = -dist;
                        var a = p[0] - b; if (a < 0) a = -a; dist += a;
                        if (dist < bestd) {
                            a = p[2] - r; if (a < 0) a = -a; dist += a;
                            if (dist < bestd) { bestd = dist; best = p[3]; }
                        }
                    }
                }
                if (j >= 0) {
                    var p = network[j], dist = g - p[1];
                    if (dist >= bestd) j = -1;
                    else {
                        j--; if (dist < 0) dist = -dist;
                        var a = p[0] - b; if (a < 0) a = -a; dist += a;
                        if (dist < bestd) {
                            a = p[2] - r; if (a < 0) a = -a; dist += a;
                            if (dist < bestd) { bestd = dist; best = p[3]; }
                        }
                    }
                }
            }
            return best;
        };
    };

    // LZW Encoder
    var LZWEncoder = function(width, height, pixels, colorDepth) {
        var EOF = -1, BITS = 12, HSIZE = 5003;
        var masks = [0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535];
        var accum = new Uint8Array(256), htab = new Int32Array(HSIZE), codetab = new Int32Array(HSIZE);
        var cur_accum = 0, cur_bits = 0, a_count = 0, free_ent = 0, maxcode, clear_flg = false;
        var g_init_bits, ClearCode, EOFCode, remaining, curPixel, n_bits, out = [];
        var initCodeSize = Math.max(2, colorDepth);
        
        function char_out(c) { accum[a_count++] = c; if (a_count >= 254) flush_char(); }
        function cl_hash(hsize) { for (var i = 0; i < hsize; ++i) htab[i] = -1; }
        function flush_char() { if (a_count > 0) { out.push(a_count); for (var i = 0; i < a_count; i++) out.push(accum[i]); a_count = 0; } }
        function nextPixel() { if (remaining === 0) return EOF; --remaining; return pixels[curPixel++] & 0xff; }
        
        function output(code) {
            cur_accum &= masks[cur_bits];
            cur_accum = cur_bits > 0 ? cur_accum | (code << cur_bits) : code;
            cur_bits += n_bits;
            while (cur_bits >= 8) { char_out(cur_accum & 0xff); cur_accum >>= 8; cur_bits -= 8; }
            if (free_ent > maxcode || clear_flg) {
                if (clear_flg) { n_bits = g_init_bits; maxcode = (1 << n_bits) - 1; clear_flg = false; }
                else { ++n_bits; maxcode = n_bits == BITS ? 1 << BITS : (1 << n_bits) - 1; }
            }
            if (code == EOFCode) { while (cur_bits > 0) { char_out(cur_accum & 0xff); cur_accum >>= 8; cur_bits -= 8; } flush_char(); }
        }
        
        function compress(init_bits) {
            g_init_bits = init_bits; clear_flg = false; n_bits = g_init_bits;
            maxcode = (1 << n_bits) - 1; ClearCode = 1 << (init_bits - 1);
            EOFCode = ClearCode + 1; free_ent = ClearCode + 2; a_count = 0;
            var ent = nextPixel(), hshift = 0;
            for (var fcode = HSIZE; fcode < 65536; fcode *= 2) ++hshift;
            hshift = 8 - hshift; cl_hash(HSIZE); output(ClearCode);
            
            var c;
            outer: while ((c = nextPixel()) != EOF) {
                var fcode = (c << BITS) + ent, i = (c << hshift) ^ ent;
                if (htab[i] === fcode) { ent = codetab[i]; continue; }
                else if (htab[i] >= 0) {
                    var disp = HSIZE - i; if (i === 0) disp = 1;
                    do { if ((i -= disp) < 0) i += HSIZE; if (htab[i] === fcode) { ent = codetab[i]; continue outer; } } while (htab[i] >= 0);
                }
                output(ent); ent = c;
                if (free_ent < 1 << BITS) { codetab[i] = free_ent++; htab[i] = fcode; }
                else { cl_hash(HSIZE); free_ent = ClearCode + 2; clear_flg = true; output(ClearCode); }
            }
            output(ent); output(EOFCode);
        }
        
        this.encode = function() { out = []; cur_accum = 0; cur_bits = 0; remaining = width * height; curPixel = 0; compress(initCodeSize + 1); return out; };
    };

    // GIF Encoder
    function GIFEncoder(width, height) {
        var out = [], image, pixels, indexedPixels, colorDepth, colorTab, usedEntry = [];
        var palSize = 7, dispose = -1, firstFrame = true, sample = 10, delay = 0, repeat = 0, transIndex = 0, transparent = null;
        
        this.setDelay = function(ms) { delay = Math.round(ms / 10); };
        this.setRepeat = function(iter) { repeat = iter; };
        this.setTransparent = function(c) { transparent = c; };
        this.setQuality = function(q) { sample = q < 1 ? 1 : q; };
        
        function getImagePixels() {
            var w = image.width, h = image.height;
            pixels = new Uint8Array(w * h * 3);
            var data = image.data, count = 0;
            for (var i = 0; i < h; i++) for (var j = 0; j < w; j++) {
                var b = (i * w * 4) + j * 4;
                pixels[count++] = data[b]; pixels[count++] = data[b + 1]; pixels[count++] = data[b + 2];
            }
        }
        
        function analyzePixels() {
            var len = pixels.length, nPix = len / 3;
            indexedPixels = new Uint8Array(nPix);
            var nq = new NeuQuant(pixels, sample);
            nq.buildColormap(); colorTab = nq.getColormap();
            var k = 0;
            for (var j = 0; j < nPix; j++) {
                var index = nq.lookupRGB(pixels[k++] & 0xff, pixels[k++] & 0xff, pixels[k++] & 0xff);
                usedEntry[index] = true; indexedPixels[j] = index;
            }
            pixels = null; colorDepth = 8; palSize = 7;
        }
        
        function writeLSD() {
            out.push(image.width & 0xff); out.push((image.width >> 8) & 0xff);
            out.push(image.height & 0xff); out.push((image.height >> 8) & 0xff);
            out.push(0x80 | 0x70 | palSize); out.push(0); out.push(0);
        }
        
        function writePalette() {
            for (var i = 0; i < colorTab.length; i++) out.push(colorTab[i]);
            for (var n = 3 * 256 - colorTab.length, j = 0; j < n; j++) out.push(0);
        }
        
        function writeNetscapeExt() {
            out.push(0x21); out.push(0xff); out.push(11);
            var app = "NETSCAPE2.0";
            for (var i = 0; i < 11; i++) out.push(app.charCodeAt(i));
            out.push(3); out.push(1); out.push(repeat & 0xff); out.push((repeat >> 8) & 0xff); out.push(0);
        }
        
        function writeGraphicCtrlExt() {
            out.push(0x21); out.push(0xf9); out.push(4);
            var transp = transparent === null ? 0 : 1, disp = transparent === null ? 0 : 2;
            if (dispose >= 0) disp = dispose & 7;
            out.push(0 | (disp << 2) | transp);
            out.push(delay & 0xff); out.push((delay >> 8) & 0xff); out.push(transIndex); out.push(0);
        }
        
        function writeImageDesc() {
            out.push(0x2c); out.push(0); out.push(0); out.push(0); out.push(0);
            out.push(image.width & 0xff); out.push((image.width >> 8) & 0xff);
            out.push(image.height & 0xff); out.push((image.height >> 8) & 0xff);
            out.push(firstFrame ? 0 : 0x80 | palSize);
        }
        
        function writePixels() {
            var enc = new LZWEncoder(image.width, image.height, indexedPixels, colorDepth);
            var encoded = enc.encode();
            out.push(colorDepth);
            for (var i = 0; i < encoded.length; i++) out.push(encoded[i]);
            out.push(0);
        }
        
        this.addFrame = function(imageData) {
            image = imageData; getImagePixels(); analyzePixels();
            if (firstFrame) { writeLSD(); writePalette(); if (repeat >= 0) writeNetscapeExt(); }
            writeGraphicCtrlExt(); writeImageDesc();
            if (!firstFrame) writePalette();
            writePixels(); firstFrame = false;
        };
        
        this.finish = function() { out.push(0x3b); };
        this.getOutput = function() { return new Uint8Array(out); };
        
        // GIF header
        out.push(0x47); out.push(0x49); out.push(0x46); out.push(0x38); out.push(0x39); out.push(0x61);
    }
    
    // Worker message handler
    self.onmessage = function(ev) {
        var data = ev.data;
        var encoder = new GIFEncoder(data.width, data.height);
        encoder.setRepeat(data.repeat || 0);
        encoder.setQuality(data.quality || 10);
        if (data.transparent !== null && data.transparent !== undefined) encoder.setTransparent(data.transparent);
        
        for (var i = 0; i < data.frames.length; i++) {
            var frame = data.frames[i];
            encoder.setDelay(frame.delay);
            encoder.addFrame(frame.data);
        }
        encoder.finish();
        
        var output = encoder.getOutput();
        self.postMessage({ type: 'finished', data: output.buffer }, [output.buffer]);
    };
})();
