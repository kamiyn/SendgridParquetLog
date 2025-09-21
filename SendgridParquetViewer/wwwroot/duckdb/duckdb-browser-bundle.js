function B(i, t, e, n) {
  function s(r) {
    return r instanceof e ? r : new e(function(o) {
      o(r);
    });
  }
  return new (e || (e = Promise))(function(r, o) {
    function a(d) {
      try {
        u(n.next(d));
      } catch (h) {
        o(h);
      }
    }
    function c(d) {
      try {
        u(n.throw(d));
      } catch (h) {
        o(h);
      }
    }
    function u(d) {
      d.done ? r(d.value) : s(d.value).then(a, c);
    }
    u((n = n.apply(i, t || [])).next());
  });
}
function Vn(i) {
  var t = typeof Symbol == "function" && Symbol.iterator, e = t && i[t], n = 0;
  if (e) return e.call(i);
  if (i && typeof i.length == "number") return {
    next: function() {
      return i && n >= i.length && (i = void 0), { value: i && i[n++], done: !i };
    }
  };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function A(i) {
  return this instanceof A ? (this.v = i, this) : new A(i);
}
function Dt(i, t, e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var n = e.apply(i, t || []), s, r = [];
  return s = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), a("next"), a("throw"), a("return", o), s[Symbol.asyncIterator] = function() {
    return this;
  }, s;
  function o(F) {
    return function(W) {
      return Promise.resolve(W).then(F, h);
    };
  }
  function a(F, W) {
    n[F] && (s[F] = function(K) {
      return new Promise(function(Te, wt) {
        r.push([F, K, Te, wt]) > 1 || c(F, K);
      });
    }, W && (s[F] = W(s[F])));
  }
  function c(F, W) {
    try {
      u(n[F](W));
    } catch (K) {
      V(r[0][3], K);
    }
  }
  function u(F) {
    F.value instanceof A ? Promise.resolve(F.value.v).then(d, h) : V(r[0][2], F);
  }
  function d(F) {
    c("next", F);
  }
  function h(F) {
    c("throw", F);
  }
  function V(F, W) {
    F(W), r.shift(), r.length && c(r[0][0], r[0][1]);
  }
}
function Je(i) {
  var t, e;
  return t = {}, n("next"), n("throw", function(s) {
    throw s;
  }), n("return"), t[Symbol.iterator] = function() {
    return this;
  }, t;
  function n(s, r) {
    t[s] = i[s] ? function(o) {
      return (e = !e) ? { value: A(i[s](o)), done: !1 } : r ? r(o) : o;
    } : r;
  }
}
function Xt(i) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = i[Symbol.asyncIterator], e;
  return t ? t.call(i) : (i = typeof Vn == "function" ? Vn(i) : i[Symbol.iterator](), e = {}, n("next"), n("throw"), n("return"), e[Symbol.asyncIterator] = function() {
    return this;
  }, e);
  function n(r) {
    e[r] = i[r] && function(o) {
      return new Promise(function(a, c) {
        o = i[r](o), s(a, c, o.done, o.value);
      });
    };
  }
  function s(r, o, a, c) {
    Promise.resolve(c).then(function(u) {
      r({ value: u, done: a });
    }, o);
  }
}
const Io = new TextDecoder("utf-8"), Xi = (i) => Io.decode(i), So = new TextEncoder(), yn = (i) => So.encode(i), Bo = (i) => typeof i == "number", ps = (i) => typeof i == "boolean", H = (i) => typeof i == "function", rt = (i) => i != null && Object(i) === i, te = (i) => rt(i) && H(i.then), $e = (i) => rt(i) && H(i[Symbol.iterator]), Be = (i) => rt(i) && H(i[Symbol.asyncIterator]), tn = (i) => rt(i) && rt(i.schema), ms = (i) => rt(i) && "done" in i && "value" in i, _s = (i) => rt(i) && H(i.stat) && Bo(i.fd), gs = (i) => rt(i) && pn(i.body), xi = (i) => "_getDOMStream" in i && "_getNodeStream" in i, Ao = (i) => rt(i) && H(i.abort) && H(i.getWriter) && !xi(i), pn = (i) => rt(i) && H(i.cancel) && H(i.getReader) && !xi(i), To = (i) => rt(i) && H(i.end) && H(i.write) && ps(i.writable) && !xi(i), bs = (i) => rt(i) && H(i.read) && H(i.pipe) && ps(i.readable) && !xi(i), Do = (i) => rt(i) && H(i.clear) && H(i.bytes) && H(i.position) && H(i.setPosition) && H(i.capacity) && H(i.getBufferIdentifier) && H(i.createLong), mn = typeof SharedArrayBuffer < "u" ? SharedArrayBuffer : ArrayBuffer;
function Fo(i) {
  const t = i[0] ? [i[0]] : [];
  let e, n, s, r;
  for (let o, a, c = 0, u = 0, d = i.length; ++c < d; ) {
    if (o = t[u], a = i[c], !o || !a || o.buffer !== a.buffer || a.byteOffset < o.byteOffset) {
      a && (t[++u] = a);
      continue;
    }
    if ({ byteOffset: e, byteLength: s } = o, { byteOffset: n, byteLength: r } = a, e + s < n || n + r < e) {
      a && (t[++u] = a);
      continue;
    }
    t[u] = new Uint8Array(o.buffer, e, n - e + r);
  }
  return t;
}
function jn(i, t, e = 0, n = t.byteLength) {
  const s = i.byteLength, r = new Uint8Array(i.buffer, i.byteOffset, s), o = new Uint8Array(t.buffer, t.byteOffset, Math.min(n, s));
  return r.set(o, e), i;
}
function Ot(i, t) {
  const e = Fo(i), n = e.reduce((d, h) => d + h.byteLength, 0);
  let s, r, o, a = 0, c = -1;
  const u = Math.min(t || Number.POSITIVE_INFINITY, n);
  for (const d = e.length; ++c < d; ) {
    if (s = e[c], r = s.subarray(0, Math.min(s.length, u - a)), u <= a + r.length) {
      r.length < s.length ? e[c] = s.subarray(r.length) : r.length === s.length && c++, o ? jn(o, r, a) : o = r;
      break;
    }
    jn(o || (o = new Uint8Array(u)), r, a), a += r.length;
  }
  return [o || new Uint8Array(0), e.slice(c), n - (o ? o.byteLength : 0)];
}
function P(i, t) {
  let e = ms(t) ? t.value : t;
  return e instanceof i ? i === Uint8Array ? new i(e.buffer, e.byteOffset, e.byteLength) : e : e ? (typeof e == "string" && (e = yn(e)), e instanceof ArrayBuffer ? new i(e) : e instanceof mn ? new i(e) : Do(e) ? P(i, e.bytes()) : ArrayBuffer.isView(e) ? e.byteLength <= 0 ? new i(0) : new i(e.buffer, e.byteOffset, e.byteLength / i.BYTES_PER_ELEMENT) : i.from(e)) : new i(0);
}
const De = (i) => P(Int32Array, i), $n = (i) => P(BigInt64Array, i), O = (i) => P(Uint8Array, i), en = (i) => (i.next(), i);
function* Oo(i, t) {
  const e = function* (s) {
    yield s;
  }, n = typeof t == "string" || ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof mn ? e(t) : $e(t) ? t : e(t);
  return yield* en((function* (s) {
    let r = null;
    do
      r = s.next(yield P(i, r));
    while (!r.done);
  })(n[Symbol.iterator]())), new i();
}
const Eo = (i) => Oo(Uint8Array, i);
function ws(i, t) {
  return Dt(this, arguments, function* () {
    if (te(t))
      return yield A(yield A(yield* Je(Xt(ws(i, yield A(t))))));
    const n = function(o) {
      return Dt(this, arguments, function* () {
        yield yield A(yield A(o));
      });
    }, s = function(o) {
      return Dt(this, arguments, function* () {
        yield A(yield* Je(Xt(en((function* (a) {
          let c = null;
          do
            c = a.next(yield c?.value);
          while (!c.done);
        })(o[Symbol.iterator]())))));
      });
    }, r = typeof t == "string" || ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof mn ? n(t) : $e(t) ? s(t) : Be(t) ? t : n(t);
    return yield A(
      // otherwise if AsyncIterable, use it
      yield* Je(Xt(en((function(o) {
        return Dt(this, arguments, function* () {
          let a = null;
          do
            a = yield A(o.next(yield yield A(P(i, a))));
          while (!a.done);
        });
      })(r[Symbol.asyncIterator]()))))
    ), yield A(new i());
  });
}
const No = (i) => ws(Uint8Array, i);
function vs(i, t, e) {
  if (i !== 0) {
    e = e.slice(0, t);
    for (let n = -1, s = e.length; ++n < s; )
      e[n] += i;
  }
  return e.subarray(0, t);
}
function Ro(i, t) {
  let e = 0;
  const n = i.length;
  if (n !== t.length)
    return !1;
  if (n > 0)
    do
      if (i[e] !== t[e])
        return !1;
    while (++e < n);
  return !0;
}
const dt = {
  fromIterable(i) {
    return qe(Lo(i));
  },
  fromAsyncIterable(i) {
    return qe(Uo(i));
  },
  fromDOMStream(i) {
    return qe(Mo(i));
  },
  fromNodeStream(i) {
    return qe(Po(i));
  },
  // @ts-ignore
  toDOMStream(i, t) {
    throw new Error('"toDOMStream" not available in this environment');
  },
  // @ts-ignore
  toNodeStream(i, t) {
    throw new Error('"toNodeStream" not available in this environment');
  }
}, qe = (i) => (i.next(), i);
function* Lo(i) {
  let t, e = !1, n = [], s, r, o, a = 0;
  function c() {
    return r === "peek" ? Ot(n, o)[0] : ([s, n, a] = Ot(n, o), s);
  }
  ({ cmd: r, size: o } = (yield null) || { cmd: "read", size: 0 });
  const u = Eo(i)[Symbol.iterator]();
  try {
    do
      if ({ done: t, value: s } = Number.isNaN(o - a) ? u.next() : u.next(o - a), !t && s.byteLength > 0 && (n.push(s), a += s.byteLength), t || o <= a)
        do
          ({ cmd: r, size: o } = yield c());
        while (o < a);
    while (!t);
  } catch (d) {
    (e = !0) && typeof u.throw == "function" && u.throw(d);
  } finally {
    e === !1 && typeof u.return == "function" && u.return(null);
  }
  return null;
}
function Uo(i) {
  return Dt(this, arguments, function* () {
    let e, n = !1, s = [], r, o, a, c = 0;
    function u() {
      return o === "peek" ? Ot(s, a)[0] : ([r, s, c] = Ot(s, a), r);
    }
    ({ cmd: o, size: a } = (yield yield A(null)) || { cmd: "read", size: 0 });
    const d = No(i)[Symbol.asyncIterator]();
    try {
      do
        if ({ done: e, value: r } = Number.isNaN(a - c) ? yield A(d.next()) : yield A(d.next(a - c)), !e && r.byteLength > 0 && (s.push(r), c += r.byteLength), e || a <= c)
          do
            ({ cmd: o, size: a } = yield yield A(u()));
          while (a < c);
      while (!e);
    } catch (h) {
      (n = !0) && typeof d.throw == "function" && (yield A(d.throw(h)));
    } finally {
      n === !1 && typeof d.return == "function" && (yield A(d.return(new Uint8Array(0))));
    }
    return yield A(null);
  });
}
function Mo(i) {
  return Dt(this, arguments, function* () {
    let e = !1, n = !1, s = [], r, o, a, c = 0;
    function u() {
      return o === "peek" ? Ot(s, a)[0] : ([r, s, c] = Ot(s, a), r);
    }
    ({ cmd: o, size: a } = (yield yield A(null)) || { cmd: "read", size: 0 });
    const d = new Co(i);
    try {
      do
        if ({ done: e, value: r } = Number.isNaN(a - c) ? yield A(d.read()) : yield A(d.read(a - c)), !e && r.byteLength > 0 && (s.push(O(r)), c += r.byteLength), e || a <= c)
          do
            ({ cmd: o, size: a } = yield yield A(u()));
          while (a < c);
      while (!e);
    } catch (h) {
      (n = !0) && (yield A(d.cancel(h)));
    } finally {
      n === !1 ? yield A(d.cancel()) : i.locked && d.releaseLock();
    }
    return yield A(null);
  });
}
class Co {
  constructor(t) {
    this.source = t, this.reader = null, this.reader = this.source.getReader(), this.reader.closed.catch(() => {
    });
  }
  get closed() {
    return this.reader ? this.reader.closed.catch(() => {
    }) : Promise.resolve();
  }
  releaseLock() {
    this.reader && this.reader.releaseLock(), this.reader = null;
  }
  cancel(t) {
    return B(this, void 0, void 0, function* () {
      const { reader: e, source: n } = this;
      e && (yield e.cancel(t).catch(() => {
      })), n && n.locked && this.releaseLock();
    });
  }
  read(t) {
    return B(this, void 0, void 0, function* () {
      if (t === 0)
        return { done: this.reader == null, value: new Uint8Array(0) };
      const e = yield this.reader.read();
      return !e.done && (e.value = O(e)), e;
    });
  }
}
const Yi = (i, t) => {
  const e = (s) => n([t, s]);
  let n;
  return [t, e, new Promise((s) => (n = s) && i.once(t, e))];
};
function Po(i) {
  return Dt(this, arguments, function* () {
    const e = [];
    let n = "error", s = !1, r = null, o, a, c = 0, u = [], d;
    function h() {
      return o === "peek" ? Ot(u, a)[0] : ([d, u, c] = Ot(u, a), d);
    }
    if ({ cmd: o, size: a } = (yield yield A(null)) || { cmd: "read", size: 0 }, i.isTTY)
      return yield yield A(new Uint8Array(0)), yield A(null);
    try {
      e[0] = Yi(i, "end"), e[1] = Yi(i, "error");
      do {
        if (e[2] = Yi(i, "readable"), [n, r] = yield A(Promise.race(e.map((F) => F[2]))), n === "error")
          break;
        if ((s = n === "end") || (Number.isFinite(a - c) ? (d = O(i.read(a - c)), d.byteLength < a - c && (d = O(i.read()))) : d = O(i.read()), d.byteLength > 0 && (u.push(d), c += d.byteLength)), s || a <= c)
          do
            ({ cmd: o, size: a } = yield yield A(h()));
          while (a < c);
      } while (!s);
    } finally {
      yield A(V(e, n === "error" ? r : null));
    }
    return yield A(null);
    function V(F, W) {
      return d = u = null, new Promise((K, Te) => {
        for (const [wt, Vt] of F)
          i.off(wt, Vt);
        try {
          const wt = i.destroy;
          wt && wt.call(i, W), W = void 0;
        } catch (wt) {
          W = wt || W;
        } finally {
          W != null ? Te(W) : K();
        }
      });
    }
  });
}
var G;
(function(i) {
  i[i.V1 = 0] = "V1", i[i.V2 = 1] = "V2", i[i.V3 = 2] = "V3", i[i.V4 = 3] = "V4", i[i.V5 = 4] = "V5";
})(G || (G = {}));
var J;
(function(i) {
  i[i.Sparse = 0] = "Sparse", i[i.Dense = 1] = "Dense";
})(J || (J = {}));
var Q;
(function(i) {
  i[i.HALF = 0] = "HALF", i[i.SINGLE = 1] = "SINGLE", i[i.DOUBLE = 2] = "DOUBLE";
})(Q || (Q = {}));
var pt;
(function(i) {
  i[i.DAY = 0] = "DAY", i[i.MILLISECOND = 1] = "MILLISECOND";
})(pt || (pt = {}));
var g;
(function(i) {
  i[i.SECOND = 0] = "SECOND", i[i.MILLISECOND = 1] = "MILLISECOND", i[i.MICROSECOND = 2] = "MICROSECOND", i[i.NANOSECOND = 3] = "NANOSECOND";
})(g || (g = {}));
var Et;
(function(i) {
  i[i.YEAR_MONTH = 0] = "YEAR_MONTH", i[i.DAY_TIME = 1] = "DAY_TIME", i[i.MONTH_DAY_NANO = 2] = "MONTH_DAY_NANO";
})(Et || (Et = {}));
const Wi = 2, Bt = 4, Ct = 4, U = 4, Yt = new Int32Array(2), Yn = new Float32Array(Yt.buffer), Wn = new Float64Array(Yt.buffer), Ke = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;
var nn;
(function(i) {
  i[i.UTF8_BYTES = 1] = "UTF8_BYTES", i[i.UTF16_STRING = 2] = "UTF16_STRING";
})(nn || (nn = {}));
let be = class Is {
  /**
   * Create a new ByteBuffer with a given array of bytes (`Uint8Array`)
   */
  constructor(t) {
    this.bytes_ = t, this.position_ = 0, this.text_decoder_ = new TextDecoder();
  }
  /**
   * Create and allocate a new ByteBuffer with a given size.
   */
  static allocate(t) {
    return new Is(new Uint8Array(t));
  }
  clear() {
    this.position_ = 0;
  }
  /**
   * Get the underlying `Uint8Array`.
   */
  bytes() {
    return this.bytes_;
  }
  /**
   * Get the buffer's position.
   */
  position() {
    return this.position_;
  }
  /**
   * Set the buffer's position.
   */
  setPosition(t) {
    this.position_ = t;
  }
  /**
   * Get the buffer's capacity.
   */
  capacity() {
    return this.bytes_.length;
  }
  readInt8(t) {
    return this.readUint8(t) << 24 >> 24;
  }
  readUint8(t) {
    return this.bytes_[t];
  }
  readInt16(t) {
    return this.readUint16(t) << 16 >> 16;
  }
  readUint16(t) {
    return this.bytes_[t] | this.bytes_[t + 1] << 8;
  }
  readInt32(t) {
    return this.bytes_[t] | this.bytes_[t + 1] << 8 | this.bytes_[t + 2] << 16 | this.bytes_[t + 3] << 24;
  }
  readUint32(t) {
    return this.readInt32(t) >>> 0;
  }
  readInt64(t) {
    return BigInt.asIntN(64, BigInt(this.readUint32(t)) + (BigInt(this.readUint32(t + 4)) << BigInt(32)));
  }
  readUint64(t) {
    return BigInt.asUintN(64, BigInt(this.readUint32(t)) + (BigInt(this.readUint32(t + 4)) << BigInt(32)));
  }
  readFloat32(t) {
    return Yt[0] = this.readInt32(t), Yn[0];
  }
  readFloat64(t) {
    return Yt[Ke ? 0 : 1] = this.readInt32(t), Yt[Ke ? 1 : 0] = this.readInt32(t + 4), Wn[0];
  }
  writeInt8(t, e) {
    this.bytes_[t] = e;
  }
  writeUint8(t, e) {
    this.bytes_[t] = e;
  }
  writeInt16(t, e) {
    this.bytes_[t] = e, this.bytes_[t + 1] = e >> 8;
  }
  writeUint16(t, e) {
    this.bytes_[t] = e, this.bytes_[t + 1] = e >> 8;
  }
  writeInt32(t, e) {
    this.bytes_[t] = e, this.bytes_[t + 1] = e >> 8, this.bytes_[t + 2] = e >> 16, this.bytes_[t + 3] = e >> 24;
  }
  writeUint32(t, e) {
    this.bytes_[t] = e, this.bytes_[t + 1] = e >> 8, this.bytes_[t + 2] = e >> 16, this.bytes_[t + 3] = e >> 24;
  }
  writeInt64(t, e) {
    this.writeInt32(t, Number(BigInt.asIntN(32, e))), this.writeInt32(t + 4, Number(BigInt.asIntN(32, e >> BigInt(32))));
  }
  writeUint64(t, e) {
    this.writeUint32(t, Number(BigInt.asUintN(32, e))), this.writeUint32(t + 4, Number(BigInt.asUintN(32, e >> BigInt(32))));
  }
  writeFloat32(t, e) {
    Yn[0] = e, this.writeInt32(t, Yt[0]);
  }
  writeFloat64(t, e) {
    Wn[0] = e, this.writeInt32(t, Yt[Ke ? 0 : 1]), this.writeInt32(t + 4, Yt[Ke ? 1 : 0]);
  }
  /**
   * Return the file identifier.   Behavior is undefined for FlatBuffers whose
   * schema does not include a file_identifier (likely points at padding or the
   * start of a the root vtable).
   */
  getBufferIdentifier() {
    if (this.bytes_.length < this.position_ + Bt + Ct)
      throw new Error("FlatBuffers: ByteBuffer is too short to contain an identifier.");
    let t = "";
    for (let e = 0; e < Ct; e++)
      t += String.fromCharCode(this.readInt8(this.position_ + Bt + e));
    return t;
  }
  /**
   * Look up a field in the vtable, return an offset into the object, or 0 if the
   * field is not present.
   */
  __offset(t, e) {
    const n = t - this.readInt32(t);
    return e < this.readInt16(n) ? this.readInt16(n + e) : 0;
  }
  /**
   * Initialize any Table-derived type to point to the union at the given offset.
   */
  __union(t, e) {
    return t.bb_pos = e + this.readInt32(e), t.bb = this, t;
  }
  /**
   * Create a JavaScript string from UTF-8 data stored inside the FlatBuffer.
   * This allocates a new string and converts to wide chars upon each access.
   *
   * To avoid the conversion to string, pass Encoding.UTF8_BYTES as the
   * "optionalEncoding" argument. This is useful for avoiding conversion when
   * the data will just be packaged back up in another FlatBuffer later on.
   *
   * @param offset
   * @param opt_encoding Defaults to UTF16_STRING
   */
  __string(t, e) {
    t += this.readInt32(t);
    const n = this.readInt32(t);
    t += Bt;
    const s = this.bytes_.subarray(t, t + n);
    return e === nn.UTF8_BYTES ? s : this.text_decoder_.decode(s);
  }
  /**
   * Handle unions that can contain string as its member, if a Table-derived type then initialize it,
   * if a string then return a new one
   *
   * WARNING: strings are immutable in JS so we can't change the string that the user gave us, this
   * makes the behaviour of __union_with_string different compared to __union
   */
  __union_with_string(t, e) {
    return typeof t == "string" ? this.__string(e) : this.__union(t, e);
  }
  /**
   * Retrieve the relative offset stored at "offset"
   */
  __indirect(t) {
    return t + this.readInt32(t);
  }
  /**
   * Get the start of data of a vector whose offset is stored at "offset" in this object.
   */
  __vector(t) {
    return t + this.readInt32(t) + Bt;
  }
  /**
   * Get the length of a vector whose offset is stored at "offset" in this object.
   */
  __vector_len(t) {
    return this.readInt32(t + this.readInt32(t));
  }
  __has_identifier(t) {
    if (t.length != Ct)
      throw new Error("FlatBuffers: file identifier must be length " + Ct);
    for (let e = 0; e < Ct; e++)
      if (t.charCodeAt(e) != this.readInt8(this.position() + Bt + e))
        return !1;
    return !0;
  }
  /**
   * A helper function for generating list for obj api
   */
  createScalarList(t, e) {
    const n = [];
    for (let s = 0; s < e; ++s) {
      const r = t(s);
      r !== null && n.push(r);
    }
    return n;
  }
  /**
   * A helper function for generating list for obj api
   * @param listAccessor function that accepts an index and return data at that index
   * @param listLength listLength
   * @param res result list
   */
  createObjList(t, e) {
    const n = [];
    for (let s = 0; s < e; ++s) {
      const r = t(s);
      r !== null && n.push(r.unpack());
    }
    return n;
  }
}, Ss = class Bs {
  /**
   * Create a FlatBufferBuilder.
   */
  constructor(t) {
    this.minalign = 1, this.vtable = null, this.vtable_in_use = 0, this.isNested = !1, this.object_start = 0, this.vtables = [], this.vector_num_elems = 0, this.force_defaults = !1, this.string_maps = null, this.text_encoder = new TextEncoder();
    let e;
    t ? e = t : e = 1024, this.bb = be.allocate(e), this.space = e;
  }
  clear() {
    this.bb.clear(), this.space = this.bb.capacity(), this.minalign = 1, this.vtable = null, this.vtable_in_use = 0, this.isNested = !1, this.object_start = 0, this.vtables = [], this.vector_num_elems = 0, this.force_defaults = !1, this.string_maps = null;
  }
  /**
   * In order to save space, fields that are set to their default value
   * don't get serialized into the buffer. Forcing defaults provides a
   * way to manually disable this optimization.
   *
   * @param forceDefaults true always serializes default values
   */
  forceDefaults(t) {
    this.force_defaults = t;
  }
  /**
   * Get the ByteBuffer representing the FlatBuffer. Only call this after you've
   * called finish(). The actual data starts at the ByteBuffer's current position,
   * not necessarily at 0.
   */
  dataBuffer() {
    return this.bb;
  }
  /**
   * Get the bytes representing the FlatBuffer. Only call this after you've
   * called finish().
   */
  asUint8Array() {
    return this.bb.bytes().subarray(this.bb.position(), this.bb.position() + this.offset());
  }
  /**
   * Prepare to write an element of `size` after `additional_bytes` have been
   * written, e.g. if you write a string, you need to align such the int length
   * field is aligned to 4 bytes, and the string data follows it directly. If all
   * you need to do is alignment, `additional_bytes` will be 0.
   *
   * @param size This is the of the new element to write
   * @param additional_bytes The padding size
   */
  prep(t, e) {
    t > this.minalign && (this.minalign = t);
    const n = ~(this.bb.capacity() - this.space + e) + 1 & t - 1;
    for (; this.space < n + t + e; ) {
      const s = this.bb.capacity();
      this.bb = Bs.growByteBuffer(this.bb), this.space += this.bb.capacity() - s;
    }
    this.pad(n);
  }
  pad(t) {
    for (let e = 0; e < t; e++)
      this.bb.writeInt8(--this.space, 0);
  }
  writeInt8(t) {
    this.bb.writeInt8(this.space -= 1, t);
  }
  writeInt16(t) {
    this.bb.writeInt16(this.space -= 2, t);
  }
  writeInt32(t) {
    this.bb.writeInt32(this.space -= 4, t);
  }
  writeInt64(t) {
    this.bb.writeInt64(this.space -= 8, t);
  }
  writeFloat32(t) {
    this.bb.writeFloat32(this.space -= 4, t);
  }
  writeFloat64(t) {
    this.bb.writeFloat64(this.space -= 8, t);
  }
  /**
   * Add an `int8` to the buffer, properly aligned, and grows the buffer (if necessary).
   * @param value The `int8` to add the buffer.
   */
  addInt8(t) {
    this.prep(1, 0), this.writeInt8(t);
  }
  /**
   * Add an `int16` to the buffer, properly aligned, and grows the buffer (if necessary).
   * @param value The `int16` to add the buffer.
   */
  addInt16(t) {
    this.prep(2, 0), this.writeInt16(t);
  }
  /**
   * Add an `int32` to the buffer, properly aligned, and grows the buffer (if necessary).
   * @param value The `int32` to add the buffer.
   */
  addInt32(t) {
    this.prep(4, 0), this.writeInt32(t);
  }
  /**
   * Add an `int64` to the buffer, properly aligned, and grows the buffer (if necessary).
   * @param value The `int64` to add the buffer.
   */
  addInt64(t) {
    this.prep(8, 0), this.writeInt64(t);
  }
  /**
   * Add a `float32` to the buffer, properly aligned, and grows the buffer (if necessary).
   * @param value The `float32` to add the buffer.
   */
  addFloat32(t) {
    this.prep(4, 0), this.writeFloat32(t);
  }
  /**
   * Add a `float64` to the buffer, properly aligned, and grows the buffer (if necessary).
   * @param value The `float64` to add the buffer.
   */
  addFloat64(t) {
    this.prep(8, 0), this.writeFloat64(t);
  }
  addFieldInt8(t, e, n) {
    (this.force_defaults || e != n) && (this.addInt8(e), this.slot(t));
  }
  addFieldInt16(t, e, n) {
    (this.force_defaults || e != n) && (this.addInt16(e), this.slot(t));
  }
  addFieldInt32(t, e, n) {
    (this.force_defaults || e != n) && (this.addInt32(e), this.slot(t));
  }
  addFieldInt64(t, e, n) {
    (this.force_defaults || e !== n) && (this.addInt64(e), this.slot(t));
  }
  addFieldFloat32(t, e, n) {
    (this.force_defaults || e != n) && (this.addFloat32(e), this.slot(t));
  }
  addFieldFloat64(t, e, n) {
    (this.force_defaults || e != n) && (this.addFloat64(e), this.slot(t));
  }
  addFieldOffset(t, e, n) {
    (this.force_defaults || e != n) && (this.addOffset(e), this.slot(t));
  }
  /**
   * Structs are stored inline, so nothing additional is being added. `d` is always 0.
   */
  addFieldStruct(t, e, n) {
    e != n && (this.nested(e), this.slot(t));
  }
  /**
   * Structures are always stored inline, they need to be created right
   * where they're used.  You'll get this assertion failure if you
   * created it elsewhere.
   */
  nested(t) {
    if (t != this.offset())
      throw new TypeError("FlatBuffers: struct must be serialized inline.");
  }
  /**
   * Should not be creating any other object, string or vector
   * while an object is being constructed
   */
  notNested() {
    if (this.isNested)
      throw new TypeError("FlatBuffers: object serialization must not be nested.");
  }
  /**
   * Set the current vtable at `voffset` to the current location in the buffer.
   */
  slot(t) {
    this.vtable !== null && (this.vtable[t] = this.offset());
  }
  /**
   * @returns Offset relative to the end of the buffer.
   */
  offset() {
    return this.bb.capacity() - this.space;
  }
  /**
   * Doubles the size of the backing ByteBuffer and copies the old data towards
   * the end of the new buffer (since we build the buffer backwards).
   *
   * @param bb The current buffer with the existing data
   * @returns A new byte buffer with the old data copied
   * to it. The data is located at the end of the buffer.
   *
   * uint8Array.set() formally takes {Array<number>|ArrayBufferView}, so to pass
   * it a uint8Array we need to suppress the type check:
   * @suppress {checkTypes}
   */
  static growByteBuffer(t) {
    const e = t.capacity();
    if (e & 3221225472)
      throw new Error("FlatBuffers: cannot grow buffer beyond 2 gigabytes.");
    const n = e << 1, s = be.allocate(n);
    return s.setPosition(n - e), s.bytes().set(t.bytes(), n - e), s;
  }
  /**
   * Adds on offset, relative to where it will be written.
   *
   * @param offset The offset to add.
   */
  addOffset(t) {
    this.prep(Bt, 0), this.writeInt32(this.offset() - t + Bt);
  }
  /**
   * Start encoding a new object in the buffer.  Users will not usually need to
   * call this directly. The FlatBuffers compiler will generate helper methods
   * that call this method internally.
   */
  startObject(t) {
    this.notNested(), this.vtable == null && (this.vtable = []), this.vtable_in_use = t;
    for (let e = 0; e < t; e++)
      this.vtable[e] = 0;
    this.isNested = !0, this.object_start = this.offset();
  }
  /**
   * Finish off writing the object that is under construction.
   *
   * @returns The offset to the object inside `dataBuffer`
   */
  endObject() {
    if (this.vtable == null || !this.isNested)
      throw new Error("FlatBuffers: endObject called without startObject");
    this.addInt32(0);
    const t = this.offset();
    let e = this.vtable_in_use - 1;
    for (; e >= 0 && this.vtable[e] == 0; e--)
      ;
    const n = e + 1;
    for (; e >= 0; e--)
      this.addInt16(this.vtable[e] != 0 ? t - this.vtable[e] : 0);
    const s = 2;
    this.addInt16(t - this.object_start);
    const r = (n + s) * Wi;
    this.addInt16(r);
    let o = 0;
    const a = this.space;
    t: for (e = 0; e < this.vtables.length; e++) {
      const c = this.bb.capacity() - this.vtables[e];
      if (r == this.bb.readInt16(c)) {
        for (let u = Wi; u < r; u += Wi)
          if (this.bb.readInt16(a + u) != this.bb.readInt16(c + u))
            continue t;
        o = this.vtables[e];
        break;
      }
    }
    return o ? (this.space = this.bb.capacity() - t, this.bb.writeInt32(this.space, o - t)) : (this.vtables.push(this.offset()), this.bb.writeInt32(this.bb.capacity() - t, this.offset() - t)), this.isNested = !1, t;
  }
  /**
   * Finalize a buffer, poiting to the given `root_table`.
   */
  finish(t, e, n) {
    const s = n ? U : 0;
    if (e) {
      const r = e;
      if (this.prep(this.minalign, Bt + Ct + s), r.length != Ct)
        throw new TypeError("FlatBuffers: file identifier must be length " + Ct);
      for (let o = Ct - 1; o >= 0; o--)
        this.writeInt8(r.charCodeAt(o));
    }
    this.prep(this.minalign, Bt + s), this.addOffset(t), s && this.addInt32(this.bb.capacity() - this.space), this.bb.setPosition(this.space);
  }
  /**
   * Finalize a size prefixed buffer, pointing to the given `root_table`.
   */
  finishSizePrefixed(t, e) {
    this.finish(t, e, !0);
  }
  /**
   * This checks a required field has been set in a given table that has
   * just been constructed.
   */
  requiredField(t, e) {
    const n = this.bb.capacity() - t, s = n - this.bb.readInt32(n);
    if (!(e < this.bb.readInt16(s) && this.bb.readInt16(s + e) != 0))
      throw new TypeError("FlatBuffers: field " + e + " must be set");
  }
  /**
   * Start a new array/vector of objects.  Users usually will not call
   * this directly. The FlatBuffers compiler will create a start/end
   * method for vector types in generated code.
   *
   * @param elem_size The size of each element in the array
   * @param num_elems The number of elements in the array
   * @param alignment The alignment of the array
   */
  startVector(t, e, n) {
    this.notNested(), this.vector_num_elems = e, this.prep(Bt, t * e), this.prep(n, t * e);
  }
  /**
   * Finish off the creation of an array and all its elements. The array must be
   * created with `startVector`.
   *
   * @returns The offset at which the newly created array
   * starts.
   */
  endVector() {
    return this.writeInt32(this.vector_num_elems), this.offset();
  }
  /**
   * Encode the string `s` in the buffer using UTF-8. If the string passed has
   * already been seen, we return the offset of the already written string
   *
   * @param s The string to encode
   * @return The offset in the buffer where the encoded string starts
   */
  createSharedString(t) {
    if (!t)
      return 0;
    if (this.string_maps || (this.string_maps = /* @__PURE__ */ new Map()), this.string_maps.has(t))
      return this.string_maps.get(t);
    const e = this.createString(t);
    return this.string_maps.set(t, e), e;
  }
  /**
   * Encode the string `s` in the buffer using UTF-8. If a Uint8Array is passed
   * instead of a string, it is assumed to contain valid UTF-8 encoded data.
   *
   * @param s The string to encode
   * @return The offset in the buffer where the encoded string starts
   */
  createString(t) {
    if (t == null)
      return 0;
    let e;
    return t instanceof Uint8Array ? e = t : e = this.text_encoder.encode(t), this.addInt8(0), this.startVector(1, e.length, 1), this.bb.setPosition(this.space -= e.length), this.bb.bytes().set(e, this.space), this.endVector();
  }
  /**
   * Create a byte vector.
   *
   * @param v The bytes to add
   * @returns The offset in the buffer where the byte vector starts
   */
  createByteVector(t) {
    return t == null ? 0 : (this.startVector(1, t.length, 1), this.bb.setPosition(this.space -= t.length), this.bb.bytes().set(t, this.space), this.endVector());
  }
  /**
   * A helper function to pack an object
   *
   * @returns offset of obj
   */
  createObjectOffset(t) {
    return t === null ? 0 : typeof t == "string" ? this.createString(t) : t.pack(this);
  }
  /**
   * A helper function to pack a list of object
   *
   * @returns list of offsets of each non null object
   */
  createObjectOffsetList(t) {
    const e = [];
    for (let n = 0; n < t.length; ++n) {
      const s = t[n];
      if (s !== null)
        e.push(this.createObjectOffset(s));
      else
        throw new TypeError("FlatBuffers: Argument for createObjectOffsetList cannot contain null.");
    }
    return e;
  }
  createStructOffsetList(t, e) {
    return e(this, t.length), this.createObjectOffsetList(t.slice().reverse()), this.endVector();
  }
};
var ci;
(function(i) {
  i[i.BUFFER = 0] = "BUFFER";
})(ci || (ci = {}));
var li;
(function(i) {
  i[i.LZ4_FRAME = 0] = "LZ4_FRAME", i[i.ZSTD = 1] = "ZSTD";
})(li || (li = {}));
class Wt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsBodyCompression(t, e) {
    return (e || new Wt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsBodyCompression(t, e) {
    return t.setPosition(t.position() + U), (e || new Wt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  /**
   * Compressor library.
   * For LZ4_FRAME, each compressed buffer must consist of a single frame.
   */
  codec() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt8(this.bb_pos + t) : li.LZ4_FRAME;
  }
  /**
   * Indicates the way the record batch body was compressed
   */
  method() {
    const t = this.bb.__offset(this.bb_pos, 6);
    return t ? this.bb.readInt8(this.bb_pos + t) : ci.BUFFER;
  }
  static startBodyCompression(t) {
    t.startObject(2);
  }
  static addCodec(t, e) {
    t.addFieldInt8(0, e, li.LZ4_FRAME);
  }
  static addMethod(t, e) {
    t.addFieldInt8(1, e, ci.BUFFER);
  }
  static endBodyCompression(t) {
    return t.endObject();
  }
  static createBodyCompression(t, e, n) {
    return Wt.startBodyCompression(t), Wt.addCodec(t, e), Wt.addMethod(t, n), Wt.endBodyCompression(t);
  }
}
class As {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  /**
   * The relative offset into the shared memory page where the bytes for this
   * buffer starts
   */
  offset() {
    return this.bb.readInt64(this.bb_pos);
  }
  /**
   * The absolute length (in bytes) of the memory buffer. The memory is found
   * from offset (inclusive) to offset + length (non-inclusive). When building
   * messages using the encapsulated IPC message, padding bytes may be written
   * after a buffer, but such padding bytes do not need to be accounted for in
   * the size here.
   */
  length() {
    return this.bb.readInt64(this.bb_pos + 8);
  }
  static sizeOf() {
    return 16;
  }
  static createBuffer(t, e, n) {
    return t.prep(8, 16), t.writeInt64(BigInt(n ?? 0)), t.writeInt64(BigInt(e ?? 0)), t.offset();
  }
}
let Ts = class {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  /**
   * The number of value slots in the Arrow array at this level of a nested
   * tree
   */
  length() {
    return this.bb.readInt64(this.bb_pos);
  }
  /**
   * The number of observed nulls. Fields with null_count == 0 may choose not
   * to write their physical validity bitmap out as a materialized buffer,
   * instead setting the length of the bitmap buffer to 0.
   */
  nullCount() {
    return this.bb.readInt64(this.bb_pos + 8);
  }
  static sizeOf() {
    return 16;
  }
  static createFieldNode(t, e, n) {
    return t.prep(8, 16), t.writeInt64(BigInt(n ?? 0)), t.writeInt64(BigInt(e ?? 0)), t.offset();
  }
}, Lt = class sn {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsRecordBatch(t, e) {
    return (e || new sn()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsRecordBatch(t, e) {
    return t.setPosition(t.position() + U), (e || new sn()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  /**
   * number of records / rows. The arrays in the batch should all have this
   * length
   */
  length() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt64(this.bb_pos + t) : BigInt("0");
  }
  /**
   * Nodes correspond to the pre-ordered flattened logical schema
   */
  nodes(t, e) {
    const n = this.bb.__offset(this.bb_pos, 6);
    return n ? (e || new Ts()).__init(this.bb.__vector(this.bb_pos + n) + t * 16, this.bb) : null;
  }
  nodesLength() {
    const t = this.bb.__offset(this.bb_pos, 6);
    return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
  }
  /**
   * Buffers correspond to the pre-ordered flattened buffer tree
   *
   * The number of buffers appended to this list depends on the schema. For
   * example, most primitive arrays will have 2 buffers, 1 for the validity
   * bitmap and 1 for the values. For struct arrays, there will only be a
   * single buffer for the validity (nulls) bitmap
   */
  buffers(t, e) {
    const n = this.bb.__offset(this.bb_pos, 8);
    return n ? (e || new As()).__init(this.bb.__vector(this.bb_pos + n) + t * 16, this.bb) : null;
  }
  buffersLength() {
    const t = this.bb.__offset(this.bb_pos, 8);
    return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
  }
  /**
   * Optional compression of the message body
   */
  compression(t) {
    const e = this.bb.__offset(this.bb_pos, 10);
    return e ? (t || new Wt()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
  }
  static startRecordBatch(t) {
    t.startObject(4);
  }
  static addLength(t, e) {
    t.addFieldInt64(0, e, BigInt("0"));
  }
  static addNodes(t, e) {
    t.addFieldOffset(1, e, 0);
  }
  static startNodesVector(t, e) {
    t.startVector(16, e, 8);
  }
  static addBuffers(t, e) {
    t.addFieldOffset(2, e, 0);
  }
  static startBuffersVector(t, e) {
    t.startVector(16, e, 8);
  }
  static addCompression(t, e) {
    t.addFieldOffset(3, e, 0);
  }
  static endRecordBatch(t) {
    return t.endObject();
  }
}, se = class rn {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsDictionaryBatch(t, e) {
    return (e || new rn()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsDictionaryBatch(t, e) {
    return t.setPosition(t.position() + U), (e || new rn()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  id() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt64(this.bb_pos + t) : BigInt("0");
  }
  data(t) {
    const e = this.bb.__offset(this.bb_pos, 6);
    return e ? (t || new Lt()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
  }
  /**
   * If isDelta is true the values in the dictionary are to be appended to a
   * dictionary with the indicated id. If isDelta is false this dictionary
   * should replace the existing dictionary.
   */
  isDelta() {
    const t = this.bb.__offset(this.bb_pos, 8);
    return t ? !!this.bb.readInt8(this.bb_pos + t) : !1;
  }
  static startDictionaryBatch(t) {
    t.startObject(3);
  }
  static addId(t, e) {
    t.addFieldInt64(0, e, BigInt("0"));
  }
  static addData(t, e) {
    t.addFieldOffset(1, e, 0);
  }
  static addIsDelta(t, e) {
    t.addFieldInt8(2, +e, 0);
  }
  static endDictionaryBatch(t) {
    return t.endObject();
  }
};
var we;
(function(i) {
  i[i.Little = 0] = "Little", i[i.Big = 1] = "Big";
})(we || (we = {}));
var ui;
(function(i) {
  i[i.DenseArray = 0] = "DenseArray";
})(ui || (ui = {}));
class ct {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsInt(t, e) {
    return (e || new ct()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsInt(t, e) {
    return t.setPosition(t.position() + U), (e || new ct()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  bitWidth() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt32(this.bb_pos + t) : 0;
  }
  isSigned() {
    const t = this.bb.__offset(this.bb_pos, 6);
    return t ? !!this.bb.readInt8(this.bb_pos + t) : !1;
  }
  static startInt(t) {
    t.startObject(2);
  }
  static addBitWidth(t, e) {
    t.addFieldInt32(0, e, 0);
  }
  static addIsSigned(t, e) {
    t.addFieldInt8(1, +e, 0);
  }
  static endInt(t) {
    return t.endObject();
  }
  static createInt(t, e, n) {
    return ct.startInt(t), ct.addBitWidth(t, e), ct.addIsSigned(t, n), ct.endInt(t);
  }
}
class Pt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsDictionaryEncoding(t, e) {
    return (e || new Pt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsDictionaryEncoding(t, e) {
    return t.setPosition(t.position() + U), (e || new Pt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  /**
   * The known dictionary id in the application where this data is used. In
   * the file or streaming formats, the dictionary ids are found in the
   * DictionaryBatch messages
   */
  id() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt64(this.bb_pos + t) : BigInt("0");
  }
  /**
   * The dictionary indices are constrained to be non-negative integers. If
   * this field is null, the indices must be signed int32. To maximize
   * cross-language compatibility and performance, implementations are
   * recommended to prefer signed integer types over unsigned integer types
   * and to avoid uint64 indices unless they are required by an application.
   */
  indexType(t) {
    const e = this.bb.__offset(this.bb_pos, 6);
    return e ? (t || new ct()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
  }
  /**
   * By default, dictionaries are not ordered, or the order does not have
   * semantic meaning. In some statistical, applications, dictionary-encoding
   * is used to represent ordered categorical data, and we provide a way to
   * preserve that metadata here
   */
  isOrdered() {
    const t = this.bb.__offset(this.bb_pos, 8);
    return t ? !!this.bb.readInt8(this.bb_pos + t) : !1;
  }
  dictionaryKind() {
    const t = this.bb.__offset(this.bb_pos, 10);
    return t ? this.bb.readInt16(this.bb_pos + t) : ui.DenseArray;
  }
  static startDictionaryEncoding(t) {
    t.startObject(4);
  }
  static addId(t, e) {
    t.addFieldInt64(0, e, BigInt("0"));
  }
  static addIndexType(t, e) {
    t.addFieldOffset(1, e, 0);
  }
  static addIsOrdered(t, e) {
    t.addFieldInt8(2, +e, 0);
  }
  static addDictionaryKind(t, e) {
    t.addFieldInt16(3, e, ui.DenseArray);
  }
  static endDictionaryEncoding(t) {
    return t.endObject();
  }
}
class q {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsKeyValue(t, e) {
    return (e || new q()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsKeyValue(t, e) {
    return t.setPosition(t.position() + U), (e || new q()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  key(t) {
    const e = this.bb.__offset(this.bb_pos, 4);
    return e ? this.bb.__string(this.bb_pos + e, t) : null;
  }
  value(t) {
    const e = this.bb.__offset(this.bb_pos, 6);
    return e ? this.bb.__string(this.bb_pos + e, t) : null;
  }
  static startKeyValue(t) {
    t.startObject(2);
  }
  static addKey(t, e) {
    t.addFieldOffset(0, e, 0);
  }
  static addValue(t, e) {
    t.addFieldOffset(1, e, 0);
  }
  static endKeyValue(t) {
    return t.endObject();
  }
  static createKeyValue(t, e, n) {
    return q.startKeyValue(t), q.addKey(t, e), q.addValue(t, n), q.endKeyValue(t);
  }
}
let Gn = class Fe {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsBinary(t, e) {
    return (e || new Fe()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsBinary(t, e) {
    return t.setPosition(t.position() + U), (e || new Fe()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startBinary(t) {
    t.startObject(0);
  }
  static endBinary(t) {
    return t.endObject();
  }
  static createBinary(t) {
    return Fe.startBinary(t), Fe.endBinary(t);
  }
}, Hn = class Oe {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsBool(t, e) {
    return (e || new Oe()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsBool(t, e) {
    return t.setPosition(t.position() + U), (e || new Oe()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startBool(t) {
    t.startObject(0);
  }
  static endBool(t) {
    return t.endObject();
  }
  static createBool(t) {
    return Oe.startBool(t), Oe.endBool(t);
  }
}, Ze = class re {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsDate(t, e) {
    return (e || new re()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsDate(t, e) {
    return t.setPosition(t.position() + U), (e || new re()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  unit() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : pt.MILLISECOND;
  }
  static startDate(t) {
    t.startObject(1);
  }
  static addUnit(t, e) {
    t.addFieldInt16(0, e, pt.MILLISECOND);
  }
  static endDate(t) {
    return t.endObject();
  }
  static createDate(t, e) {
    return re.startDate(t), re.addUnit(t, e), re.endDate(t);
  }
}, oe = class $t {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsDecimal(t, e) {
    return (e || new $t()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsDecimal(t, e) {
    return t.setPosition(t.position() + U), (e || new $t()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  /**
   * Total number of decimal digits
   */
  precision() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt32(this.bb_pos + t) : 0;
  }
  /**
   * Number of digits after the decimal point "."
   */
  scale() {
    const t = this.bb.__offset(this.bb_pos, 6);
    return t ? this.bb.readInt32(this.bb_pos + t) : 0;
  }
  /**
   * Number of bits per value. The only accepted widths are 128 and 256.
   * We use bitWidth for consistency with Int::bitWidth.
   */
  bitWidth() {
    const t = this.bb.__offset(this.bb_pos, 8);
    return t ? this.bb.readInt32(this.bb_pos + t) : 128;
  }
  static startDecimal(t) {
    t.startObject(3);
  }
  static addPrecision(t, e) {
    t.addFieldInt32(0, e, 0);
  }
  static addScale(t, e) {
    t.addFieldInt32(1, e, 0);
  }
  static addBitWidth(t, e) {
    t.addFieldInt32(2, e, 128);
  }
  static endDecimal(t) {
    return t.endObject();
  }
  static createDecimal(t, e, n, s) {
    return $t.startDecimal(t), $t.addPrecision(t, e), $t.addScale(t, n), $t.addBitWidth(t, s), $t.endDecimal(t);
  }
}, Xe = class ae {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsDuration(t, e) {
    return (e || new ae()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsDuration(t, e) {
    return t.setPosition(t.position() + U), (e || new ae()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  unit() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : g.MILLISECOND;
  }
  static startDuration(t) {
    t.startObject(1);
  }
  static addUnit(t, e) {
    t.addFieldInt16(0, e, g.MILLISECOND);
  }
  static endDuration(t) {
    return t.endObject();
  }
  static createDuration(t, e) {
    return ae.startDuration(t), ae.addUnit(t, e), ae.endDuration(t);
  }
}, ti = class ce {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsFixedSizeBinary(t, e) {
    return (e || new ce()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsFixedSizeBinary(t, e) {
    return t.setPosition(t.position() + U), (e || new ce()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  /**
   * Number of bytes per value
   */
  byteWidth() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt32(this.bb_pos + t) : 0;
  }
  static startFixedSizeBinary(t) {
    t.startObject(1);
  }
  static addByteWidth(t, e) {
    t.addFieldInt32(0, e, 0);
  }
  static endFixedSizeBinary(t) {
    return t.endObject();
  }
  static createFixedSizeBinary(t, e) {
    return ce.startFixedSizeBinary(t), ce.addByteWidth(t, e), ce.endFixedSizeBinary(t);
  }
}, ei = class le {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsFixedSizeList(t, e) {
    return (e || new le()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsFixedSizeList(t, e) {
    return t.setPosition(t.position() + U), (e || new le()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  /**
   * Number of list items per value
   */
  listSize() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt32(this.bb_pos + t) : 0;
  }
  static startFixedSizeList(t) {
    t.startObject(1);
  }
  static addListSize(t, e) {
    t.addFieldInt32(0, e, 0);
  }
  static endFixedSizeList(t) {
    return t.endObject();
  }
  static createFixedSizeList(t, e) {
    return le.startFixedSizeList(t), le.addListSize(t, e), le.endFixedSizeList(t);
  }
};
class At {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsFloatingPoint(t, e) {
    return (e || new At()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsFloatingPoint(t, e) {
    return t.setPosition(t.position() + U), (e || new At()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  precision() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : Q.HALF;
  }
  static startFloatingPoint(t) {
    t.startObject(1);
  }
  static addPrecision(t, e) {
    t.addFieldInt16(0, e, Q.HALF);
  }
  static endFloatingPoint(t) {
    return t.endObject();
  }
  static createFloatingPoint(t, e) {
    return At.startFloatingPoint(t), At.addPrecision(t, e), At.endFloatingPoint(t);
  }
}
class Tt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsInterval(t, e) {
    return (e || new Tt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsInterval(t, e) {
    return t.setPosition(t.position() + U), (e || new Tt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  unit() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : Et.YEAR_MONTH;
  }
  static startInterval(t) {
    t.startObject(1);
  }
  static addUnit(t, e) {
    t.addFieldInt16(0, e, Et.YEAR_MONTH);
  }
  static endInterval(t) {
    return t.endObject();
  }
  static createInterval(t, e) {
    return Tt.startInterval(t), Tt.addUnit(t, e), Tt.endInterval(t);
  }
}
let qn = class Ee {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsLargeBinary(t, e) {
    return (e || new Ee()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsLargeBinary(t, e) {
    return t.setPosition(t.position() + U), (e || new Ee()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startLargeBinary(t) {
    t.startObject(0);
  }
  static endLargeBinary(t) {
    return t.endObject();
  }
  static createLargeBinary(t) {
    return Ee.startLargeBinary(t), Ee.endLargeBinary(t);
  }
}, Kn = class Ne {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsLargeUtf8(t, e) {
    return (e || new Ne()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsLargeUtf8(t, e) {
    return t.setPosition(t.position() + U), (e || new Ne()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startLargeUtf8(t) {
    t.startObject(0);
  }
  static endLargeUtf8(t) {
    return t.endObject();
  }
  static createLargeUtf8(t) {
    return Ne.startLargeUtf8(t), Ne.endLargeUtf8(t);
  }
}, Qn = class Re {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsList(t, e) {
    return (e || new Re()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsList(t, e) {
    return t.setPosition(t.position() + U), (e || new Re()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startList(t) {
    t.startObject(0);
  }
  static endList(t) {
    return t.endObject();
  }
  static createList(t) {
    return Re.startList(t), Re.endList(t);
  }
}, ii = class ue {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsMap(t, e) {
    return (e || new ue()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsMap(t, e) {
    return t.setPosition(t.position() + U), (e || new ue()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  /**
   * Set to true if the keys within each value are sorted
   */
  keysSorted() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? !!this.bb.readInt8(this.bb_pos + t) : !1;
  }
  static startMap(t) {
    t.startObject(1);
  }
  static addKeysSorted(t, e) {
    t.addFieldInt8(0, +e, 0);
  }
  static endMap(t) {
    return t.endObject();
  }
  static createMap(t, e) {
    return ue.startMap(t), ue.addKeysSorted(t, e), ue.endMap(t);
  }
}, Jn = class Le {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsNull(t, e) {
    return (e || new Le()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsNull(t, e) {
    return t.setPosition(t.position() + U), (e || new Le()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startNull(t) {
    t.startObject(0);
  }
  static endNull(t) {
    return t.endObject();
  }
  static createNull(t) {
    return Le.startNull(t), Le.endNull(t);
  }
};
class Zt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsStruct_(t, e) {
    return (e || new Zt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsStruct_(t, e) {
    return t.setPosition(t.position() + U), (e || new Zt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startStruct_(t) {
    t.startObject(0);
  }
  static endStruct_(t) {
    return t.endObject();
  }
  static createStruct_(t) {
    return Zt.startStruct_(t), Zt.endStruct_(t);
  }
}
class ht {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsTime(t, e) {
    return (e || new ht()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsTime(t, e) {
    return t.setPosition(t.position() + U), (e || new ht()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  unit() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : g.MILLISECOND;
  }
  bitWidth() {
    const t = this.bb.__offset(this.bb_pos, 6);
    return t ? this.bb.readInt32(this.bb_pos + t) : 32;
  }
  static startTime(t) {
    t.startObject(2);
  }
  static addUnit(t, e) {
    t.addFieldInt16(0, e, g.MILLISECOND);
  }
  static addBitWidth(t, e) {
    t.addFieldInt32(1, e, 32);
  }
  static endTime(t) {
    return t.endObject();
  }
  static createTime(t, e, n) {
    return ht.startTime(t), ht.addUnit(t, e), ht.addBitWidth(t, n), ht.endTime(t);
  }
}
class ft {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsTimestamp(t, e) {
    return (e || new ft()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsTimestamp(t, e) {
    return t.setPosition(t.position() + U), (e || new ft()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  unit() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : g.SECOND;
  }
  timezone(t) {
    const e = this.bb.__offset(this.bb_pos, 6);
    return e ? this.bb.__string(this.bb_pos + e, t) : null;
  }
  static startTimestamp(t) {
    t.startObject(2);
  }
  static addUnit(t, e) {
    t.addFieldInt16(0, e, g.SECOND);
  }
  static addTimezone(t, e) {
    t.addFieldOffset(1, e, 0);
  }
  static endTimestamp(t) {
    return t.endObject();
  }
  static createTimestamp(t, e, n) {
    return ft.startTimestamp(t), ft.addUnit(t, e), ft.addTimezone(t, n), ft.endTimestamp(t);
  }
}
class nt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsUnion(t, e) {
    return (e || new nt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsUnion(t, e) {
    return t.setPosition(t.position() + U), (e || new nt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  mode() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : J.Sparse;
  }
  typeIds(t) {
    const e = this.bb.__offset(this.bb_pos, 6);
    return e ? this.bb.readInt32(this.bb.__vector(this.bb_pos + e) + t * 4) : 0;
  }
  typeIdsLength() {
    const t = this.bb.__offset(this.bb_pos, 6);
    return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
  }
  typeIdsArray() {
    const t = this.bb.__offset(this.bb_pos, 6);
    return t ? new Int32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + t), this.bb.__vector_len(this.bb_pos + t)) : null;
  }
  static startUnion(t) {
    t.startObject(2);
  }
  static addMode(t, e) {
    t.addFieldInt16(0, e, J.Sparse);
  }
  static addTypeIds(t, e) {
    t.addFieldOffset(1, e, 0);
  }
  static createTypeIdsVector(t, e) {
    t.startVector(4, e.length, 4);
    for (let n = e.length - 1; n >= 0; n--)
      t.addInt32(e[n]);
    return t.endVector();
  }
  static startTypeIdsVector(t, e) {
    t.startVector(4, e, 4);
  }
  static endUnion(t) {
    return t.endObject();
  }
  static createUnion(t, e, n) {
    return nt.startUnion(t), nt.addMode(t, e), nt.addTypeIds(t, n), nt.endUnion(t);
  }
}
let Zn = class Ue {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsUtf8(t, e) {
    return (e || new Ue()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsUtf8(t, e) {
    return t.setPosition(t.position() + U), (e || new Ue()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startUtf8(t) {
    t.startObject(0);
  }
  static endUtf8(t) {
    return t.endObject();
  }
  static createUtf8(t) {
    return Ue.startUtf8(t), Ue.endUtf8(t);
  }
};
var x;
(function(i) {
  i[i.NONE = 0] = "NONE", i[i.Null = 1] = "Null", i[i.Int = 2] = "Int", i[i.FloatingPoint = 3] = "FloatingPoint", i[i.Binary = 4] = "Binary", i[i.Utf8 = 5] = "Utf8", i[i.Bool = 6] = "Bool", i[i.Decimal = 7] = "Decimal", i[i.Date = 8] = "Date", i[i.Time = 9] = "Time", i[i.Timestamp = 10] = "Timestamp", i[i.Interval = 11] = "Interval", i[i.List = 12] = "List", i[i.Struct_ = 13] = "Struct_", i[i.Union = 14] = "Union", i[i.FixedSizeBinary = 15] = "FixedSizeBinary", i[i.FixedSizeList = 16] = "FixedSizeList", i[i.Map = 17] = "Map", i[i.Duration = 18] = "Duration", i[i.LargeBinary = 19] = "LargeBinary", i[i.LargeUtf8 = 20] = "LargeUtf8", i[i.LargeList = 21] = "LargeList", i[i.RunEndEncoded = 22] = "RunEndEncoded";
})(x || (x = {}));
let ut = class ni {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsField(t, e) {
    return (e || new ni()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsField(t, e) {
    return t.setPosition(t.position() + U), (e || new ni()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  name(t) {
    const e = this.bb.__offset(this.bb_pos, 4);
    return e ? this.bb.__string(this.bb_pos + e, t) : null;
  }
  /**
   * Whether or not this field can contain nulls. Should be true in general.
   */
  nullable() {
    const t = this.bb.__offset(this.bb_pos, 6);
    return t ? !!this.bb.readInt8(this.bb_pos + t) : !1;
  }
  typeType() {
    const t = this.bb.__offset(this.bb_pos, 8);
    return t ? this.bb.readUint8(this.bb_pos + t) : x.NONE;
  }
  /**
   * This is the type of the decoded value if the field is dictionary encoded.
   */
  type(t) {
    const e = this.bb.__offset(this.bb_pos, 10);
    return e ? this.bb.__union(t, this.bb_pos + e) : null;
  }
  /**
   * Present only if the field is dictionary encoded.
   */
  dictionary(t) {
    const e = this.bb.__offset(this.bb_pos, 12);
    return e ? (t || new Pt()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
  }
  /**
   * children apply only to nested data types like Struct, List and Union. For
   * primitive types children will have length 0.
   */
  children(t, e) {
    const n = this.bb.__offset(this.bb_pos, 14);
    return n ? (e || new ni()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + n) + t * 4), this.bb) : null;
  }
  childrenLength() {
    const t = this.bb.__offset(this.bb_pos, 14);
    return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
  }
  /**
   * User-defined metadata
   */
  customMetadata(t, e) {
    const n = this.bb.__offset(this.bb_pos, 16);
    return n ? (e || new q()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + n) + t * 4), this.bb) : null;
  }
  customMetadataLength() {
    const t = this.bb.__offset(this.bb_pos, 16);
    return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
  }
  static startField(t) {
    t.startObject(7);
  }
  static addName(t, e) {
    t.addFieldOffset(0, e, 0);
  }
  static addNullable(t, e) {
    t.addFieldInt8(1, +e, 0);
  }
  static addTypeType(t, e) {
    t.addFieldInt8(2, e, x.NONE);
  }
  static addType(t, e) {
    t.addFieldOffset(3, e, 0);
  }
  static addDictionary(t, e) {
    t.addFieldOffset(4, e, 0);
  }
  static addChildren(t, e) {
    t.addFieldOffset(5, e, 0);
  }
  static createChildrenVector(t, e) {
    t.startVector(4, e.length, 4);
    for (let n = e.length - 1; n >= 0; n--)
      t.addOffset(e[n]);
    return t.endVector();
  }
  static startChildrenVector(t, e) {
    t.startVector(4, e, 4);
  }
  static addCustomMetadata(t, e) {
    t.addFieldOffset(6, e, 0);
  }
  static createCustomMetadataVector(t, e) {
    t.startVector(4, e.length, 4);
    for (let n = e.length - 1; n >= 0; n--)
      t.addOffset(e[n]);
    return t.endVector();
  }
  static startCustomMetadataVector(t, e) {
    t.startVector(4, e, 4);
  }
  static endField(t) {
    return t.endObject();
  }
}, It = class Rt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsSchema(t, e) {
    return (e || new Rt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsSchema(t, e) {
    return t.setPosition(t.position() + U), (e || new Rt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  /**
   * endianness of the buffer
   * it is Little Endian by default
   * if endianness doesn't match the underlying system then the vectors need to be converted
   */
  endianness() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : we.Little;
  }
  fields(t, e) {
    const n = this.bb.__offset(this.bb_pos, 6);
    return n ? (e || new ut()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + n) + t * 4), this.bb) : null;
  }
  fieldsLength() {
    const t = this.bb.__offset(this.bb_pos, 6);
    return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
  }
  customMetadata(t, e) {
    const n = this.bb.__offset(this.bb_pos, 8);
    return n ? (e || new q()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + n) + t * 4), this.bb) : null;
  }
  customMetadataLength() {
    const t = this.bb.__offset(this.bb_pos, 8);
    return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
  }
  /**
   * Features used in the stream/file.
   */
  features(t) {
    const e = this.bb.__offset(this.bb_pos, 10);
    return e ? this.bb.readInt64(this.bb.__vector(this.bb_pos + e) + t * 8) : BigInt(0);
  }
  featuresLength() {
    const t = this.bb.__offset(this.bb_pos, 10);
    return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
  }
  static startSchema(t) {
    t.startObject(4);
  }
  static addEndianness(t, e) {
    t.addFieldInt16(0, e, we.Little);
  }
  static addFields(t, e) {
    t.addFieldOffset(1, e, 0);
  }
  static createFieldsVector(t, e) {
    t.startVector(4, e.length, 4);
    for (let n = e.length - 1; n >= 0; n--)
      t.addOffset(e[n]);
    return t.endVector();
  }
  static startFieldsVector(t, e) {
    t.startVector(4, e, 4);
  }
  static addCustomMetadata(t, e) {
    t.addFieldOffset(2, e, 0);
  }
  static createCustomMetadataVector(t, e) {
    t.startVector(4, e.length, 4);
    for (let n = e.length - 1; n >= 0; n--)
      t.addOffset(e[n]);
    return t.endVector();
  }
  static startCustomMetadataVector(t, e) {
    t.startVector(4, e, 4);
  }
  static addFeatures(t, e) {
    t.addFieldOffset(3, e, 0);
  }
  static createFeaturesVector(t, e) {
    t.startVector(8, e.length, 8);
    for (let n = e.length - 1; n >= 0; n--)
      t.addInt64(e[n]);
    return t.endVector();
  }
  static startFeaturesVector(t, e) {
    t.startVector(8, e, 8);
  }
  static endSchema(t) {
    return t.endObject();
  }
  static finishSchemaBuffer(t, e) {
    t.finish(e);
  }
  static finishSizePrefixedSchemaBuffer(t, e) {
    t.finish(e, void 0, !0);
  }
  static createSchema(t, e, n, s, r) {
    return Rt.startSchema(t), Rt.addEndianness(t, e), Rt.addFields(t, n), Rt.addCustomMetadata(t, s), Rt.addFeatures(t, r), Rt.endSchema(t);
  }
};
var N;
(function(i) {
  i[i.NONE = 0] = "NONE", i[i.Schema = 1] = "Schema", i[i.DictionaryBatch = 2] = "DictionaryBatch", i[i.RecordBatch = 3] = "RecordBatch", i[i.Tensor = 4] = "Tensor", i[i.SparseTensor = 5] = "SparseTensor";
})(N || (N = {}));
var l;
(function(i) {
  i[i.NONE = 0] = "NONE", i[i.Null = 1] = "Null", i[i.Int = 2] = "Int", i[i.Float = 3] = "Float", i[i.Binary = 4] = "Binary", i[i.Utf8 = 5] = "Utf8", i[i.Bool = 6] = "Bool", i[i.Decimal = 7] = "Decimal", i[i.Date = 8] = "Date", i[i.Time = 9] = "Time", i[i.Timestamp = 10] = "Timestamp", i[i.Interval = 11] = "Interval", i[i.List = 12] = "List", i[i.Struct = 13] = "Struct", i[i.Union = 14] = "Union", i[i.FixedSizeBinary = 15] = "FixedSizeBinary", i[i.FixedSizeList = 16] = "FixedSizeList", i[i.Map = 17] = "Map", i[i.Duration = 18] = "Duration", i[i.LargeBinary = 19] = "LargeBinary", i[i.LargeUtf8 = 20] = "LargeUtf8", i[i.Dictionary = -1] = "Dictionary", i[i.Int8 = -2] = "Int8", i[i.Int16 = -3] = "Int16", i[i.Int32 = -4] = "Int32", i[i.Int64 = -5] = "Int64", i[i.Uint8 = -6] = "Uint8", i[i.Uint16 = -7] = "Uint16", i[i.Uint32 = -8] = "Uint32", i[i.Uint64 = -9] = "Uint64", i[i.Float16 = -10] = "Float16", i[i.Float32 = -11] = "Float32", i[i.Float64 = -12] = "Float64", i[i.DateDay = -13] = "DateDay", i[i.DateMillisecond = -14] = "DateMillisecond", i[i.TimestampSecond = -15] = "TimestampSecond", i[i.TimestampMillisecond = -16] = "TimestampMillisecond", i[i.TimestampMicrosecond = -17] = "TimestampMicrosecond", i[i.TimestampNanosecond = -18] = "TimestampNanosecond", i[i.TimeSecond = -19] = "TimeSecond", i[i.TimeMillisecond = -20] = "TimeMillisecond", i[i.TimeMicrosecond = -21] = "TimeMicrosecond", i[i.TimeNanosecond = -22] = "TimeNanosecond", i[i.DenseUnion = -23] = "DenseUnion", i[i.SparseUnion = -24] = "SparseUnion", i[i.IntervalDayTime = -25] = "IntervalDayTime", i[i.IntervalYearMonth = -26] = "IntervalYearMonth", i[i.DurationSecond = -27] = "DurationSecond", i[i.DurationMillisecond = -28] = "DurationMillisecond", i[i.DurationMicrosecond = -29] = "DurationMicrosecond", i[i.DurationNanosecond = -30] = "DurationNanosecond";
})(l || (l = {}));
var Ut;
(function(i) {
  i[i.OFFSET = 0] = "OFFSET", i[i.DATA = 1] = "DATA", i[i.VALIDITY = 2] = "VALIDITY", i[i.TYPE = 3] = "TYPE";
})(Ut || (Ut = {}));
const ko = void 0;
function Pe(i) {
  if (i === null)
    return "null";
  if (i === ko)
    return "undefined";
  switch (typeof i) {
    case "number":
      return `${i}`;
    case "bigint":
      return `${i}`;
    case "string":
      return `"${i}"`;
  }
  return typeof i[Symbol.toPrimitive] == "function" ? i[Symbol.toPrimitive]("string") : ArrayBuffer.isView(i) ? i instanceof BigInt64Array || i instanceof BigUint64Array ? `[${[...i].map((t) => Pe(t))}]` : `[${i}]` : ArrayBuffer.isView(i) ? `[${i}]` : JSON.stringify(i, (t, e) => typeof e == "bigint" ? `${e}` : e);
}
function k(i) {
  if (typeof i == "bigint" && (i < Number.MIN_SAFE_INTEGER || i > Number.MAX_SAFE_INTEGER))
    throw new TypeError(`${i} is not safe to convert to a number.`);
  return Number(i);
}
function Ds(i, t) {
  return k(i / t) + k(i % t) / k(t);
}
const xo = Symbol.for("isArrowBigNum");
function bt(i, ...t) {
  return t.length === 0 ? Object.setPrototypeOf(P(this.TypedArray, i), this.constructor.prototype) : Object.setPrototypeOf(new this.TypedArray(i, ...t), this.constructor.prototype);
}
bt.prototype[xo] = !0;
bt.prototype.toJSON = function() {
  return `"${xe(this)}"`;
};
bt.prototype.valueOf = function(i) {
  return Fs(this, i);
};
bt.prototype.toString = function() {
  return xe(this);
};
bt.prototype[Symbol.toPrimitive] = function(i = "default") {
  switch (i) {
    case "number":
      return Fs(this);
    case "string":
      return xe(this);
    case "default":
      return jo(this);
  }
  return xe(this);
};
function pe(...i) {
  return bt.apply(this, i);
}
function me(...i) {
  return bt.apply(this, i);
}
function ke(...i) {
  return bt.apply(this, i);
}
Object.setPrototypeOf(pe.prototype, Object.create(Int32Array.prototype));
Object.setPrototypeOf(me.prototype, Object.create(Uint32Array.prototype));
Object.setPrototypeOf(ke.prototype, Object.create(Uint32Array.prototype));
Object.assign(pe.prototype, bt.prototype, { constructor: pe, signed: !0, TypedArray: Int32Array, BigIntArray: BigInt64Array });
Object.assign(me.prototype, bt.prototype, { constructor: me, signed: !1, TypedArray: Uint32Array, BigIntArray: BigUint64Array });
Object.assign(ke.prototype, bt.prototype, { constructor: ke, signed: !0, TypedArray: Uint32Array, BigIntArray: BigUint64Array });
const zo = BigInt(4294967296) * BigInt(4294967296), Vo = zo - BigInt(1);
function Fs(i, t) {
  const { buffer: e, byteOffset: n, byteLength: s, signed: r } = i, o = new BigUint64Array(e, n, s / 8), a = r && o.at(-1) & BigInt(1) << BigInt(63);
  let c = BigInt(0), u = 0;
  if (a) {
    for (const d of o)
      c |= (d ^ Vo) * (BigInt(1) << BigInt(64 * u++));
    c *= BigInt(-1), c -= BigInt(1);
  } else
    for (const d of o)
      c |= d * (BigInt(1) << BigInt(64 * u++));
  if (typeof t == "number") {
    const d = BigInt(Math.pow(10, t)), h = c / d, V = c % d;
    return k(h) + k(V) / k(d);
  }
  return k(c);
}
function xe(i) {
  if (i.byteLength === 8)
    return `${new i.BigIntArray(i.buffer, i.byteOffset, 1)[0]}`;
  if (!i.signed)
    return Gi(i);
  let t = new Uint16Array(i.buffer, i.byteOffset, i.byteLength / 2);
  if (new Int16Array([t.at(-1)])[0] >= 0)
    return Gi(i);
  t = t.slice();
  let n = 1;
  for (let r = 0; r < t.length; r++) {
    const o = t[r], a = ~o + n;
    t[r] = a, n &= o === 0 ? 1 : 0;
  }
  return `-${Gi(t)}`;
}
function jo(i) {
  return i.byteLength === 8 ? new i.BigIntArray(i.buffer, i.byteOffset, 1)[0] : xe(i);
}
function Gi(i) {
  let t = "";
  const e = new Uint32Array(2);
  let n = new Uint16Array(i.buffer, i.byteOffset, i.byteLength / 2);
  const s = new Uint32Array((n = new Uint16Array(n).reverse()).buffer);
  let r = -1;
  const o = n.length - 1;
  do {
    for (e[0] = n[r = 0]; r < o; )
      n[r++] = e[1] = e[0] / 10, e[0] = (e[0] - e[1] * 10 << 16) + n[r];
    n[r] = e[1] = e[0] / 10, e[0] = e[0] - e[1] * 10, t = `${e[0]}${t}`;
  } while (s[0] || s[1] || s[2] || s[3]);
  return t ?? "0";
}
class _n {
  /** @nocollapse */
  static new(t, e) {
    switch (e) {
      case !0:
        return new pe(t);
      case !1:
        return new me(t);
    }
    switch (t.constructor) {
      case Int8Array:
      case Int16Array:
      case Int32Array:
      case BigInt64Array:
        return new pe(t);
    }
    return t.byteLength === 16 ? new ke(t) : new me(t);
  }
  /** @nocollapse */
  static signed(t) {
    return new pe(t);
  }
  /** @nocollapse */
  static unsigned(t) {
    return new me(t);
  }
  /** @nocollapse */
  static decimal(t) {
    return new ke(t);
  }
  constructor(t, e) {
    return _n.new(t, e);
  }
}
var Os, Es, Ns, Rs, Ls, Us, Ms, Cs, Ps, ks, xs, zs, Vs, js, $s, Ys, Ws, Gs, Hs, qs, Ks, Qs;
class f {
  /** @nocollapse */
  static isNull(t) {
    return t?.typeId === l.Null;
  }
  /** @nocollapse */
  static isInt(t) {
    return t?.typeId === l.Int;
  }
  /** @nocollapse */
  static isFloat(t) {
    return t?.typeId === l.Float;
  }
  /** @nocollapse */
  static isBinary(t) {
    return t?.typeId === l.Binary;
  }
  /** @nocollapse */
  static isLargeBinary(t) {
    return t?.typeId === l.LargeBinary;
  }
  /** @nocollapse */
  static isUtf8(t) {
    return t?.typeId === l.Utf8;
  }
  /** @nocollapse */
  static isLargeUtf8(t) {
    return t?.typeId === l.LargeUtf8;
  }
  /** @nocollapse */
  static isBool(t) {
    return t?.typeId === l.Bool;
  }
  /** @nocollapse */
  static isDecimal(t) {
    return t?.typeId === l.Decimal;
  }
  /** @nocollapse */
  static isDate(t) {
    return t?.typeId === l.Date;
  }
  /** @nocollapse */
  static isTime(t) {
    return t?.typeId === l.Time;
  }
  /** @nocollapse */
  static isTimestamp(t) {
    return t?.typeId === l.Timestamp;
  }
  /** @nocollapse */
  static isInterval(t) {
    return t?.typeId === l.Interval;
  }
  /** @nocollapse */
  static isDuration(t) {
    return t?.typeId === l.Duration;
  }
  /** @nocollapse */
  static isList(t) {
    return t?.typeId === l.List;
  }
  /** @nocollapse */
  static isStruct(t) {
    return t?.typeId === l.Struct;
  }
  /** @nocollapse */
  static isUnion(t) {
    return t?.typeId === l.Union;
  }
  /** @nocollapse */
  static isFixedSizeBinary(t) {
    return t?.typeId === l.FixedSizeBinary;
  }
  /** @nocollapse */
  static isFixedSizeList(t) {
    return t?.typeId === l.FixedSizeList;
  }
  /** @nocollapse */
  static isMap(t) {
    return t?.typeId === l.Map;
  }
  /** @nocollapse */
  static isDictionary(t) {
    return t?.typeId === l.Dictionary;
  }
  /** @nocollapse */
  static isDenseUnion(t) {
    return f.isUnion(t) && t.mode === J.Dense;
  }
  /** @nocollapse */
  static isSparseUnion(t) {
    return f.isUnion(t) && t.mode === J.Sparse;
  }
  constructor(t) {
    this.typeId = t;
  }
}
Os = Symbol.toStringTag;
f[Os] = ((i) => (i.children = null, i.ArrayType = Array, i.OffsetArrayType = Int32Array, i[Symbol.toStringTag] = "DataType"))(f.prototype);
class Gt extends f {
  constructor() {
    super(l.Null);
  }
  toString() {
    return "Null";
  }
}
Es = Symbol.toStringTag;
Gt[Es] = ((i) => i[Symbol.toStringTag] = "Null")(Gt.prototype);
class ee extends f {
  constructor(t, e) {
    super(l.Int), this.isSigned = t, this.bitWidth = e;
  }
  get ArrayType() {
    switch (this.bitWidth) {
      case 8:
        return this.isSigned ? Int8Array : Uint8Array;
      case 16:
        return this.isSigned ? Int16Array : Uint16Array;
      case 32:
        return this.isSigned ? Int32Array : Uint32Array;
      case 64:
        return this.isSigned ? BigInt64Array : BigUint64Array;
    }
    throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
  }
  toString() {
    return `${this.isSigned ? "I" : "Ui"}nt${this.bitWidth}`;
  }
}
Ns = Symbol.toStringTag;
ee[Ns] = ((i) => (i.isSigned = null, i.bitWidth = null, i[Symbol.toStringTag] = "Int"))(ee.prototype);
class ze extends ee {
  constructor() {
    super(!0, 32);
  }
  get ArrayType() {
    return Int32Array;
  }
}
Object.defineProperty(ze.prototype, "ArrayType", { value: Int32Array });
class di extends f {
  constructor(t) {
    super(l.Float), this.precision = t;
  }
  get ArrayType() {
    switch (this.precision) {
      case Q.HALF:
        return Uint16Array;
      case Q.SINGLE:
        return Float32Array;
      case Q.DOUBLE:
        return Float64Array;
    }
    throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
  }
  toString() {
    return `Float${this.precision << 5 || 16}`;
  }
}
Rs = Symbol.toStringTag;
di[Rs] = ((i) => (i.precision = null, i[Symbol.toStringTag] = "Float"))(di.prototype);
class hi extends f {
  constructor() {
    super(l.Binary);
  }
  toString() {
    return "Binary";
  }
}
Ls = Symbol.toStringTag;
hi[Ls] = ((i) => (i.ArrayType = Uint8Array, i[Symbol.toStringTag] = "Binary"))(hi.prototype);
class fi extends f {
  constructor() {
    super(l.LargeBinary);
  }
  toString() {
    return "LargeBinary";
  }
}
Us = Symbol.toStringTag;
fi[Us] = ((i) => (i.ArrayType = Uint8Array, i.OffsetArrayType = BigInt64Array, i[Symbol.toStringTag] = "LargeBinary"))(fi.prototype);
class yi extends f {
  constructor() {
    super(l.Utf8);
  }
  toString() {
    return "Utf8";
  }
}
Ms = Symbol.toStringTag;
yi[Ms] = ((i) => (i.ArrayType = Uint8Array, i[Symbol.toStringTag] = "Utf8"))(yi.prototype);
class pi extends f {
  constructor() {
    super(l.LargeUtf8);
  }
  toString() {
    return "LargeUtf8";
  }
}
Cs = Symbol.toStringTag;
pi[Cs] = ((i) => (i.ArrayType = Uint8Array, i.OffsetArrayType = BigInt64Array, i[Symbol.toStringTag] = "LargeUtf8"))(pi.prototype);
class mi extends f {
  constructor() {
    super(l.Bool);
  }
  toString() {
    return "Bool";
  }
}
Ps = Symbol.toStringTag;
mi[Ps] = ((i) => (i.ArrayType = Uint8Array, i[Symbol.toStringTag] = "Bool"))(mi.prototype);
class _i extends f {
  constructor(t, e, n = 128) {
    super(l.Decimal), this.scale = t, this.precision = e, this.bitWidth = n;
  }
  toString() {
    return `Decimal[${this.precision}e${this.scale > 0 ? "+" : ""}${this.scale}]`;
  }
}
ks = Symbol.toStringTag;
_i[ks] = ((i) => (i.scale = null, i.precision = null, i.ArrayType = Uint32Array, i[Symbol.toStringTag] = "Decimal"))(_i.prototype);
class gi extends f {
  constructor(t) {
    super(l.Date), this.unit = t;
  }
  toString() {
    return `Date${(this.unit + 1) * 32}<${pt[this.unit]}>`;
  }
  get ArrayType() {
    return this.unit === pt.DAY ? Int32Array : BigInt64Array;
  }
}
xs = Symbol.toStringTag;
gi[xs] = ((i) => (i.unit = null, i[Symbol.toStringTag] = "Date"))(gi.prototype);
class bi extends f {
  constructor(t, e) {
    super(l.Time), this.unit = t, this.bitWidth = e;
  }
  toString() {
    return `Time${this.bitWidth}<${g[this.unit]}>`;
  }
  get ArrayType() {
    switch (this.bitWidth) {
      case 32:
        return Int32Array;
      case 64:
        return BigInt64Array;
    }
    throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
  }
}
zs = Symbol.toStringTag;
bi[zs] = ((i) => (i.unit = null, i.bitWidth = null, i[Symbol.toStringTag] = "Time"))(bi.prototype);
class wi extends f {
  constructor(t, e) {
    super(l.Timestamp), this.unit = t, this.timezone = e;
  }
  toString() {
    return `Timestamp<${g[this.unit]}${this.timezone ? `, ${this.timezone}` : ""}>`;
  }
}
Vs = Symbol.toStringTag;
wi[Vs] = ((i) => (i.unit = null, i.timezone = null, i.ArrayType = BigInt64Array, i[Symbol.toStringTag] = "Timestamp"))(wi.prototype);
class vi extends f {
  constructor(t) {
    super(l.Interval), this.unit = t;
  }
  toString() {
    return `Interval<${Et[this.unit]}>`;
  }
}
js = Symbol.toStringTag;
vi[js] = ((i) => (i.unit = null, i.ArrayType = Int32Array, i[Symbol.toStringTag] = "Interval"))(vi.prototype);
class Ii extends f {
  constructor(t) {
    super(l.Duration), this.unit = t;
  }
  toString() {
    return `Duration<${g[this.unit]}>`;
  }
}
$s = Symbol.toStringTag;
Ii[$s] = ((i) => (i.unit = null, i.ArrayType = BigInt64Array, i[Symbol.toStringTag] = "Duration"))(Ii.prototype);
class Si extends f {
  constructor(t) {
    super(l.List), this.children = [t];
  }
  toString() {
    return `List<${this.valueType}>`;
  }
  get valueType() {
    return this.children[0].type;
  }
  get valueField() {
    return this.children[0];
  }
  get ArrayType() {
    return this.valueType.ArrayType;
  }
}
Ys = Symbol.toStringTag;
Si[Ys] = ((i) => (i.children = null, i[Symbol.toStringTag] = "List"))(Si.prototype);
class X extends f {
  constructor(t) {
    super(l.Struct), this.children = t;
  }
  toString() {
    return `Struct<{${this.children.map((t) => `${t.name}:${t.type}`).join(", ")}}>`;
  }
}
Ws = Symbol.toStringTag;
X[Ws] = ((i) => (i.children = null, i[Symbol.toStringTag] = "Struct"))(X.prototype);
class Bi extends f {
  constructor(t, e, n) {
    super(l.Union), this.mode = t, this.children = n, this.typeIds = e = Int32Array.from(e), this.typeIdToChildIndex = e.reduce((s, r, o) => (s[r] = o) && s || s, /* @__PURE__ */ Object.create(null));
  }
  toString() {
    return `${this[Symbol.toStringTag]}<${this.children.map((t) => `${t.type}`).join(" | ")}>`;
  }
}
Gs = Symbol.toStringTag;
Bi[Gs] = ((i) => (i.mode = null, i.typeIds = null, i.children = null, i.typeIdToChildIndex = null, i.ArrayType = Int8Array, i[Symbol.toStringTag] = "Union"))(Bi.prototype);
class Ai extends f {
  constructor(t) {
    super(l.FixedSizeBinary), this.byteWidth = t;
  }
  toString() {
    return `FixedSizeBinary[${this.byteWidth}]`;
  }
}
Hs = Symbol.toStringTag;
Ai[Hs] = ((i) => (i.byteWidth = null, i.ArrayType = Uint8Array, i[Symbol.toStringTag] = "FixedSizeBinary"))(Ai.prototype);
class Ti extends f {
  constructor(t, e) {
    super(l.FixedSizeList), this.listSize = t, this.children = [e];
  }
  get valueType() {
    return this.children[0].type;
  }
  get valueField() {
    return this.children[0];
  }
  get ArrayType() {
    return this.valueType.ArrayType;
  }
  toString() {
    return `FixedSizeList[${this.listSize}]<${this.valueType}>`;
  }
}
qs = Symbol.toStringTag;
Ti[qs] = ((i) => (i.children = null, i.listSize = null, i[Symbol.toStringTag] = "FixedSizeList"))(Ti.prototype);
class Di extends f {
  constructor(t, e = !1) {
    var n, s, r;
    if (super(l.Map), this.children = [t], this.keysSorted = e, t && (t.name = "entries", !((n = t?.type) === null || n === void 0) && n.children)) {
      const o = (s = t?.type) === null || s === void 0 ? void 0 : s.children[0];
      o && (o.name = "key");
      const a = (r = t?.type) === null || r === void 0 ? void 0 : r.children[1];
      a && (a.name = "value");
    }
  }
  get keyType() {
    return this.children[0].type.children[0].type;
  }
  get valueType() {
    return this.children[0].type.children[1].type;
  }
  get childType() {
    return this.children[0].type;
  }
  toString() {
    return `Map<{${this.children[0].type.children.map((t) => `${t.name}:${t.type}`).join(", ")}}>`;
  }
}
Ks = Symbol.toStringTag;
Di[Ks] = ((i) => (i.children = null, i.keysSorted = null, i[Symbol.toStringTag] = "Map_"))(Di.prototype);
const $o = /* @__PURE__ */ ((i) => () => ++i)(-1);
class ve extends f {
  constructor(t, e, n, s) {
    super(l.Dictionary), this.indices = e, this.dictionary = t, this.isOrdered = s || !1, this.id = n == null ? $o() : k(n);
  }
  get children() {
    return this.dictionary.children;
  }
  get valueType() {
    return this.dictionary;
  }
  get ArrayType() {
    return this.dictionary.ArrayType;
  }
  toString() {
    return `Dictionary<${this.indices}, ${this.dictionary}>`;
  }
}
Qs = Symbol.toStringTag;
ve[Qs] = ((i) => (i.id = null, i.indices = null, i.isOrdered = null, i.dictionary = null, i[Symbol.toStringTag] = "Dictionary"))(ve.prototype);
function Mt(i) {
  const t = i;
  switch (i.typeId) {
    case l.Decimal:
      return i.bitWidth / 32;
    case l.Interval:
      return 1 + t.unit;
    // case Type.Int: return 1 + +((t as Int_).bitWidth > 32);
    // case Type.Time: return 1 + +((t as Time_).bitWidth > 32);
    case l.FixedSizeList:
      return t.listSize;
    case l.FixedSizeBinary:
      return t.byteWidth;
    default:
      return 1;
  }
}
class T {
  visitMany(t, ...e) {
    return t.map((n, s) => this.visit(n, ...e.map((r) => r[s])));
  }
  visit(...t) {
    return this.getVisitFn(t[0], !1).apply(this, t);
  }
  getVisitFn(t, e = !0) {
    return Yo(this, t, e);
  }
  getVisitFnByTypeId(t, e = !0) {
    return de(this, t, e);
  }
  visitNull(t, ...e) {
    return null;
  }
  visitBool(t, ...e) {
    return null;
  }
  visitInt(t, ...e) {
    return null;
  }
  visitFloat(t, ...e) {
    return null;
  }
  visitUtf8(t, ...e) {
    return null;
  }
  visitLargeUtf8(t, ...e) {
    return null;
  }
  visitBinary(t, ...e) {
    return null;
  }
  visitLargeBinary(t, ...e) {
    return null;
  }
  visitFixedSizeBinary(t, ...e) {
    return null;
  }
  visitDate(t, ...e) {
    return null;
  }
  visitTimestamp(t, ...e) {
    return null;
  }
  visitTime(t, ...e) {
    return null;
  }
  visitDecimal(t, ...e) {
    return null;
  }
  visitList(t, ...e) {
    return null;
  }
  visitStruct(t, ...e) {
    return null;
  }
  visitUnion(t, ...e) {
    return null;
  }
  visitDictionary(t, ...e) {
    return null;
  }
  visitInterval(t, ...e) {
    return null;
  }
  visitDuration(t, ...e) {
    return null;
  }
  visitFixedSizeList(t, ...e) {
    return null;
  }
  visitMap(t, ...e) {
    return null;
  }
}
function Yo(i, t, e = !0) {
  return typeof t == "number" ? de(i, t, e) : typeof t == "string" && t in l ? de(i, l[t], e) : t && t instanceof f ? de(i, Xn(t), e) : t?.type && t.type instanceof f ? de(i, Xn(t.type), e) : de(i, l.NONE, e);
}
function de(i, t, e = !0) {
  let n = null;
  switch (t) {
    case l.Null:
      n = i.visitNull;
      break;
    case l.Bool:
      n = i.visitBool;
      break;
    case l.Int:
      n = i.visitInt;
      break;
    case l.Int8:
      n = i.visitInt8 || i.visitInt;
      break;
    case l.Int16:
      n = i.visitInt16 || i.visitInt;
      break;
    case l.Int32:
      n = i.visitInt32 || i.visitInt;
      break;
    case l.Int64:
      n = i.visitInt64 || i.visitInt;
      break;
    case l.Uint8:
      n = i.visitUint8 || i.visitInt;
      break;
    case l.Uint16:
      n = i.visitUint16 || i.visitInt;
      break;
    case l.Uint32:
      n = i.visitUint32 || i.visitInt;
      break;
    case l.Uint64:
      n = i.visitUint64 || i.visitInt;
      break;
    case l.Float:
      n = i.visitFloat;
      break;
    case l.Float16:
      n = i.visitFloat16 || i.visitFloat;
      break;
    case l.Float32:
      n = i.visitFloat32 || i.visitFloat;
      break;
    case l.Float64:
      n = i.visitFloat64 || i.visitFloat;
      break;
    case l.Utf8:
      n = i.visitUtf8;
      break;
    case l.LargeUtf8:
      n = i.visitLargeUtf8;
      break;
    case l.Binary:
      n = i.visitBinary;
      break;
    case l.LargeBinary:
      n = i.visitLargeBinary;
      break;
    case l.FixedSizeBinary:
      n = i.visitFixedSizeBinary;
      break;
    case l.Date:
      n = i.visitDate;
      break;
    case l.DateDay:
      n = i.visitDateDay || i.visitDate;
      break;
    case l.DateMillisecond:
      n = i.visitDateMillisecond || i.visitDate;
      break;
    case l.Timestamp:
      n = i.visitTimestamp;
      break;
    case l.TimestampSecond:
      n = i.visitTimestampSecond || i.visitTimestamp;
      break;
    case l.TimestampMillisecond:
      n = i.visitTimestampMillisecond || i.visitTimestamp;
      break;
    case l.TimestampMicrosecond:
      n = i.visitTimestampMicrosecond || i.visitTimestamp;
      break;
    case l.TimestampNanosecond:
      n = i.visitTimestampNanosecond || i.visitTimestamp;
      break;
    case l.Time:
      n = i.visitTime;
      break;
    case l.TimeSecond:
      n = i.visitTimeSecond || i.visitTime;
      break;
    case l.TimeMillisecond:
      n = i.visitTimeMillisecond || i.visitTime;
      break;
    case l.TimeMicrosecond:
      n = i.visitTimeMicrosecond || i.visitTime;
      break;
    case l.TimeNanosecond:
      n = i.visitTimeNanosecond || i.visitTime;
      break;
    case l.Decimal:
      n = i.visitDecimal;
      break;
    case l.List:
      n = i.visitList;
      break;
    case l.Struct:
      n = i.visitStruct;
      break;
    case l.Union:
      n = i.visitUnion;
      break;
    case l.DenseUnion:
      n = i.visitDenseUnion || i.visitUnion;
      break;
    case l.SparseUnion:
      n = i.visitSparseUnion || i.visitUnion;
      break;
    case l.Dictionary:
      n = i.visitDictionary;
      break;
    case l.Interval:
      n = i.visitInterval;
      break;
    case l.IntervalDayTime:
      n = i.visitIntervalDayTime || i.visitInterval;
      break;
    case l.IntervalYearMonth:
      n = i.visitIntervalYearMonth || i.visitInterval;
      break;
    case l.Duration:
      n = i.visitDuration;
      break;
    case l.DurationSecond:
      n = i.visitDurationSecond || i.visitDuration;
      break;
    case l.DurationMillisecond:
      n = i.visitDurationMillisecond || i.visitDuration;
      break;
    case l.DurationMicrosecond:
      n = i.visitDurationMicrosecond || i.visitDuration;
      break;
    case l.DurationNanosecond:
      n = i.visitDurationNanosecond || i.visitDuration;
      break;
    case l.FixedSizeList:
      n = i.visitFixedSizeList;
      break;
    case l.Map:
      n = i.visitMap;
      break;
  }
  if (typeof n == "function")
    return n;
  if (!e)
    return () => null;
  throw new Error(`Unrecognized type '${l[t]}'`);
}
function Xn(i) {
  switch (i.typeId) {
    case l.Null:
      return l.Null;
    case l.Int: {
      const { bitWidth: t, isSigned: e } = i;
      switch (t) {
        case 8:
          return e ? l.Int8 : l.Uint8;
        case 16:
          return e ? l.Int16 : l.Uint16;
        case 32:
          return e ? l.Int32 : l.Uint32;
        case 64:
          return e ? l.Int64 : l.Uint64;
      }
      return l.Int;
    }
    case l.Float:
      switch (i.precision) {
        case Q.HALF:
          return l.Float16;
        case Q.SINGLE:
          return l.Float32;
        case Q.DOUBLE:
          return l.Float64;
      }
      return l.Float;
    case l.Binary:
      return l.Binary;
    case l.LargeBinary:
      return l.LargeBinary;
    case l.Utf8:
      return l.Utf8;
    case l.LargeUtf8:
      return l.LargeUtf8;
    case l.Bool:
      return l.Bool;
    case l.Decimal:
      return l.Decimal;
    case l.Time:
      switch (i.unit) {
        case g.SECOND:
          return l.TimeSecond;
        case g.MILLISECOND:
          return l.TimeMillisecond;
        case g.MICROSECOND:
          return l.TimeMicrosecond;
        case g.NANOSECOND:
          return l.TimeNanosecond;
      }
      return l.Time;
    case l.Timestamp:
      switch (i.unit) {
        case g.SECOND:
          return l.TimestampSecond;
        case g.MILLISECOND:
          return l.TimestampMillisecond;
        case g.MICROSECOND:
          return l.TimestampMicrosecond;
        case g.NANOSECOND:
          return l.TimestampNanosecond;
      }
      return l.Timestamp;
    case l.Date:
      switch (i.unit) {
        case pt.DAY:
          return l.DateDay;
        case pt.MILLISECOND:
          return l.DateMillisecond;
      }
      return l.Date;
    case l.Interval:
      switch (i.unit) {
        case Et.DAY_TIME:
          return l.IntervalDayTime;
        case Et.YEAR_MONTH:
          return l.IntervalYearMonth;
      }
      return l.Interval;
    case l.Duration:
      switch (i.unit) {
        case g.SECOND:
          return l.DurationSecond;
        case g.MILLISECOND:
          return l.DurationMillisecond;
        case g.MICROSECOND:
          return l.DurationMicrosecond;
        case g.NANOSECOND:
          return l.DurationNanosecond;
      }
      return l.Duration;
    case l.Map:
      return l.Map;
    case l.List:
      return l.List;
    case l.Struct:
      return l.Struct;
    case l.Union:
      switch (i.mode) {
        case J.Dense:
          return l.DenseUnion;
        case J.Sparse:
          return l.SparseUnion;
      }
      return l.Union;
    case l.FixedSizeBinary:
      return l.FixedSizeBinary;
    case l.FixedSizeList:
      return l.FixedSizeList;
    case l.Dictionary:
      return l.Dictionary;
  }
  throw new Error(`Unrecognized type '${l[i.typeId]}'`);
}
T.prototype.visitInt8 = null;
T.prototype.visitInt16 = null;
T.prototype.visitInt32 = null;
T.prototype.visitInt64 = null;
T.prototype.visitUint8 = null;
T.prototype.visitUint16 = null;
T.prototype.visitUint32 = null;
T.prototype.visitUint64 = null;
T.prototype.visitFloat16 = null;
T.prototype.visitFloat32 = null;
T.prototype.visitFloat64 = null;
T.prototype.visitDateDay = null;
T.prototype.visitDateMillisecond = null;
T.prototype.visitTimestampSecond = null;
T.prototype.visitTimestampMillisecond = null;
T.prototype.visitTimestampMicrosecond = null;
T.prototype.visitTimestampNanosecond = null;
T.prototype.visitTimeSecond = null;
T.prototype.visitTimeMillisecond = null;
T.prototype.visitTimeMicrosecond = null;
T.prototype.visitTimeNanosecond = null;
T.prototype.visitDenseUnion = null;
T.prototype.visitSparseUnion = null;
T.prototype.visitIntervalDayTime = null;
T.prototype.visitIntervalYearMonth = null;
T.prototype.visitDuration = null;
T.prototype.visitDurationSecond = null;
T.prototype.visitDurationMillisecond = null;
T.prototype.visitDurationMicrosecond = null;
T.prototype.visitDurationNanosecond = null;
const Js = new Float64Array(1), ne = new Uint32Array(Js.buffer);
function Zs(i) {
  const t = (i & 31744) >> 10, e = (i & 1023) / 1024, n = Math.pow(-1, (i & 32768) >> 15);
  switch (t) {
    case 31:
      return n * (e ? Number.NaN : 1 / 0);
    case 0:
      return n * (e ? 6103515625e-14 * e : 0);
  }
  return n * Math.pow(2, t - 15) * (1 + e);
}
function Wo(i) {
  if (i !== i)
    return 32256;
  Js[0] = i;
  const t = (ne[1] & 2147483648) >> 16 & 65535;
  let e = ne[1] & 2146435072, n = 0;
  return e >= 1089470464 ? ne[0] > 0 ? e = 31744 : (e = (e & 2080374784) >> 16, n = (ne[1] & 1048575) >> 10) : e <= 1056964608 ? (n = 1048576 + (ne[1] & 1048575), n = 1048576 + (n << (e >> 20) - 998) >> 21, e = 0) : (e = e - 1056964608 >> 10, n = (ne[1] & 1048575) + 512 >> 10), t | e | n & 65535;
}
class b extends T {
}
function I(i) {
  return (t, e, n) => {
    if (t.setValid(e, n != null))
      return i(t, e, n);
  };
}
const Go = (i, t, e) => {
  i[t] = Math.floor(e / 864e5);
}, Xs = (i, t, e, n) => {
  if (e + 1 < t.length) {
    const s = k(t[e]), r = k(t[e + 1]);
    i.set(n.subarray(0, r - s), s);
  }
}, Ho = ({ offset: i, values: t }, e, n) => {
  const s = i + e;
  n ? t[s >> 3] |= 1 << s % 8 : t[s >> 3] &= ~(1 << s % 8);
}, kt = ({ values: i }, t, e) => {
  i[t] = e;
}, gn = ({ values: i }, t, e) => {
  i[t] = e;
}, tr = ({ values: i }, t, e) => {
  i[t] = Wo(e);
}, qo = (i, t, e) => {
  switch (i.type.precision) {
    case Q.HALF:
      return tr(i, t, e);
    case Q.SINGLE:
    case Q.DOUBLE:
      return gn(i, t, e);
  }
}, er = ({ values: i }, t, e) => {
  Go(i, t, e.valueOf());
}, ir = ({ values: i }, t, e) => {
  i[t] = BigInt(e);
}, Ko = ({ stride: i, values: t }, e, n) => {
  t.set(n.subarray(0, i), i * e);
}, nr = ({ values: i, valueOffsets: t }, e, n) => Xs(i, t, e, n), sr = ({ values: i, valueOffsets: t }, e, n) => Xs(i, t, e, yn(n)), Qo = (i, t, e) => {
  i.type.unit === pt.DAY ? er(i, t, e) : ir(i, t, e);
}, rr = ({ values: i }, t, e) => {
  i[t] = BigInt(e / 1e3);
}, or = ({ values: i }, t, e) => {
  i[t] = BigInt(e);
}, ar = ({ values: i }, t, e) => {
  i[t] = BigInt(e * 1e3);
}, cr = ({ values: i }, t, e) => {
  i[t] = BigInt(e * 1e6);
}, Jo = (i, t, e) => {
  switch (i.type.unit) {
    case g.SECOND:
      return rr(i, t, e);
    case g.MILLISECOND:
      return or(i, t, e);
    case g.MICROSECOND:
      return ar(i, t, e);
    case g.NANOSECOND:
      return cr(i, t, e);
  }
}, lr = ({ values: i }, t, e) => {
  i[t] = e;
}, ur = ({ values: i }, t, e) => {
  i[t] = e;
}, dr = ({ values: i }, t, e) => {
  i[t] = e;
}, hr = ({ values: i }, t, e) => {
  i[t] = e;
}, Zo = (i, t, e) => {
  switch (i.type.unit) {
    case g.SECOND:
      return lr(i, t, e);
    case g.MILLISECOND:
      return ur(i, t, e);
    case g.MICROSECOND:
      return dr(i, t, e);
    case g.NANOSECOND:
      return hr(i, t, e);
  }
}, Xo = ({ values: i, stride: t }, e, n) => {
  i.set(n.subarray(0, t), t * e);
}, ta = (i, t, e) => {
  const n = i.children[0], s = i.valueOffsets, r = mt.getVisitFn(n);
  if (Array.isArray(e))
    for (let o = -1, a = s[t], c = s[t + 1]; a < c; )
      r(n, a++, e[++o]);
  else
    for (let o = -1, a = s[t], c = s[t + 1]; a < c; )
      r(n, a++, e.get(++o));
}, ea = (i, t, e) => {
  const n = i.children[0], { valueOffsets: s } = i, r = mt.getVisitFn(n);
  let { [t]: o, [t + 1]: a } = s;
  const c = e instanceof Map ? e.entries() : Object.entries(e);
  for (const u of c)
    if (r(n, o, u), ++o >= a)
      break;
}, ia = (i, t) => (e, n, s, r) => n && e(n, i, t[r]), na = (i, t) => (e, n, s, r) => n && e(n, i, t.get(r)), sa = (i, t) => (e, n, s, r) => n && e(n, i, t.get(s.name)), ra = (i, t) => (e, n, s, r) => n && e(n, i, t[s.name]), oa = (i, t, e) => {
  const n = i.type.children.map((r) => mt.getVisitFn(r.type)), s = e instanceof Map ? sa(t, e) : e instanceof R ? na(t, e) : Array.isArray(e) ? ia(t, e) : ra(t, e);
  i.type.children.forEach((r, o) => s(n[o], i.children[o], r, o));
}, aa = (i, t, e) => {
  i.type.mode === J.Dense ? fr(i, t, e) : yr(i, t, e);
}, fr = (i, t, e) => {
  const n = i.type.typeIdToChildIndex[i.typeIds[t]], s = i.children[n];
  mt.visit(s, i.valueOffsets[t], e);
}, yr = (i, t, e) => {
  const n = i.type.typeIdToChildIndex[i.typeIds[t]], s = i.children[n];
  mt.visit(s, t, e);
}, ca = (i, t, e) => {
  var n;
  (n = i.dictionary) === null || n === void 0 || n.set(i.values[t], e);
}, la = (i, t, e) => {
  i.type.unit === Et.DAY_TIME ? pr(i, t, e) : mr(i, t, e);
}, pr = ({ values: i }, t, e) => {
  i.set(e.subarray(0, 2), 2 * t);
}, mr = ({ values: i }, t, e) => {
  i[t] = e[0] * 12 + e[1] % 12;
}, _r = ({ values: i }, t, e) => {
  i[t] = e;
}, gr = ({ values: i }, t, e) => {
  i[t] = e;
}, br = ({ values: i }, t, e) => {
  i[t] = e;
}, wr = ({ values: i }, t, e) => {
  i[t] = e;
}, ua = (i, t, e) => {
  switch (i.type.unit) {
    case g.SECOND:
      return _r(i, t, e);
    case g.MILLISECOND:
      return gr(i, t, e);
    case g.MICROSECOND:
      return br(i, t, e);
    case g.NANOSECOND:
      return wr(i, t, e);
  }
}, da = (i, t, e) => {
  const { stride: n } = i, s = i.children[0], r = mt.getVisitFn(s);
  if (Array.isArray(e))
    for (let o = -1, a = t * n; ++o < n; )
      r(s, a + o, e[o]);
  else
    for (let o = -1, a = t * n; ++o < n; )
      r(s, a + o, e.get(o));
};
b.prototype.visitBool = I(Ho);
b.prototype.visitInt = I(kt);
b.prototype.visitInt8 = I(kt);
b.prototype.visitInt16 = I(kt);
b.prototype.visitInt32 = I(kt);
b.prototype.visitInt64 = I(kt);
b.prototype.visitUint8 = I(kt);
b.prototype.visitUint16 = I(kt);
b.prototype.visitUint32 = I(kt);
b.prototype.visitUint64 = I(kt);
b.prototype.visitFloat = I(qo);
b.prototype.visitFloat16 = I(tr);
b.prototype.visitFloat32 = I(gn);
b.prototype.visitFloat64 = I(gn);
b.prototype.visitUtf8 = I(sr);
b.prototype.visitLargeUtf8 = I(sr);
b.prototype.visitBinary = I(nr);
b.prototype.visitLargeBinary = I(nr);
b.prototype.visitFixedSizeBinary = I(Ko);
b.prototype.visitDate = I(Qo);
b.prototype.visitDateDay = I(er);
b.prototype.visitDateMillisecond = I(ir);
b.prototype.visitTimestamp = I(Jo);
b.prototype.visitTimestampSecond = I(rr);
b.prototype.visitTimestampMillisecond = I(or);
b.prototype.visitTimestampMicrosecond = I(ar);
b.prototype.visitTimestampNanosecond = I(cr);
b.prototype.visitTime = I(Zo);
b.prototype.visitTimeSecond = I(lr);
b.prototype.visitTimeMillisecond = I(ur);
b.prototype.visitTimeMicrosecond = I(dr);
b.prototype.visitTimeNanosecond = I(hr);
b.prototype.visitDecimal = I(Xo);
b.prototype.visitList = I(ta);
b.prototype.visitStruct = I(oa);
b.prototype.visitUnion = I(aa);
b.prototype.visitDenseUnion = I(fr);
b.prototype.visitSparseUnion = I(yr);
b.prototype.visitDictionary = I(ca);
b.prototype.visitInterval = I(la);
b.prototype.visitIntervalDayTime = I(pr);
b.prototype.visitIntervalYearMonth = I(mr);
b.prototype.visitDuration = I(ua);
b.prototype.visitDurationSecond = I(_r);
b.prototype.visitDurationMillisecond = I(gr);
b.prototype.visitDurationMicrosecond = I(br);
b.prototype.visitDurationNanosecond = I(wr);
b.prototype.visitFixedSizeList = I(da);
b.prototype.visitMap = I(ea);
const mt = new b(), _t = Symbol.for("parent"), _e = Symbol.for("rowIndex");
class bn {
  constructor(t, e) {
    return this[_t] = t, this[_e] = e, new Proxy(this, new fa());
  }
  toArray() {
    return Object.values(this.toJSON());
  }
  toJSON() {
    const t = this[_e], e = this[_t], n = e.type.children, s = {};
    for (let r = -1, o = n.length; ++r < o; )
      s[n[r].name] = ot.visit(e.children[r], t);
    return s;
  }
  toString() {
    return `{${[...this].map(([t, e]) => `${Pe(t)}: ${Pe(e)}`).join(", ")}}`;
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toString();
  }
  [Symbol.iterator]() {
    return new ha(this[_t], this[_e]);
  }
}
class ha {
  constructor(t, e) {
    this.childIndex = 0, this.children = t.children, this.rowIndex = e, this.childFields = t.type.children, this.numChildren = this.childFields.length;
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    const t = this.childIndex;
    return t < this.numChildren ? (this.childIndex = t + 1, {
      done: !1,
      value: [
        this.childFields[t].name,
        ot.visit(this.children[t], this.rowIndex)
      ]
    }) : { done: !0, value: null };
  }
}
Object.defineProperties(bn.prototype, {
  [Symbol.toStringTag]: { enumerable: !1, configurable: !1, value: "Row" },
  [_t]: { writable: !0, enumerable: !1, configurable: !1, value: null },
  [_e]: { writable: !0, enumerable: !1, configurable: !1, value: -1 }
});
class fa {
  isExtensible() {
    return !1;
  }
  deleteProperty() {
    return !1;
  }
  preventExtensions() {
    return !0;
  }
  ownKeys(t) {
    return t[_t].type.children.map((e) => e.name);
  }
  has(t, e) {
    return t[_t].type.children.findIndex((n) => n.name === e) !== -1;
  }
  getOwnPropertyDescriptor(t, e) {
    if (t[_t].type.children.findIndex((n) => n.name === e) !== -1)
      return { writable: !0, enumerable: !0, configurable: !0 };
  }
  get(t, e) {
    if (Reflect.has(t, e))
      return t[e];
    const n = t[_t].type.children.findIndex((s) => s.name === e);
    if (n !== -1) {
      const s = ot.visit(t[_t].children[n], t[_e]);
      return Reflect.set(t, e, s), s;
    }
  }
  set(t, e, n) {
    const s = t[_t].type.children.findIndex((r) => r.name === e);
    return s !== -1 ? (mt.visit(t[_t].children[s], t[_e], n), Reflect.set(t, e, n)) : Reflect.has(t, e) || typeof e == "symbol" ? Reflect.set(t, e, n) : !1;
  }
}
class y extends T {
}
function w(i) {
  return (t, e) => t.getValid(e) ? i(t, e) : null;
}
const ya = (i, t) => 864e5 * i[t], pa = (i, t) => null, vr = (i, t, e) => {
  if (e + 1 >= t.length)
    return null;
  const n = k(t[e]), s = k(t[e + 1]);
  return i.subarray(n, s);
}, ma = ({ offset: i, values: t }, e) => {
  const n = i + e;
  return (t[n >> 3] & 1 << n % 8) !== 0;
}, Ir = ({ values: i }, t) => ya(i, t), Sr = ({ values: i }, t) => k(i[t]), Qt = ({ stride: i, values: t }, e) => t[i * e], _a = ({ stride: i, values: t }, e) => Zs(t[i * e]), Br = ({ values: i }, t) => i[t], ga = ({ stride: i, values: t }, e) => t.subarray(i * e, i * (e + 1)), Ar = ({ values: i, valueOffsets: t }, e) => vr(i, t, e), Tr = ({ values: i, valueOffsets: t }, e) => {
  const n = vr(i, t, e);
  return n !== null ? Xi(n) : null;
}, ba = ({ values: i }, t) => i[t], wa = ({ type: i, values: t }, e) => i.precision !== Q.HALF ? t[e] : Zs(t[e]), va = (i, t) => i.type.unit === pt.DAY ? Ir(i, t) : Sr(i, t), Dr = ({ values: i }, t) => 1e3 * k(i[t]), Fr = ({ values: i }, t) => k(i[t]), Or = ({ values: i }, t) => Ds(i[t], BigInt(1e3)), Er = ({ values: i }, t) => Ds(i[t], BigInt(1e6)), Ia = (i, t) => {
  switch (i.type.unit) {
    case g.SECOND:
      return Dr(i, t);
    case g.MILLISECOND:
      return Fr(i, t);
    case g.MICROSECOND:
      return Or(i, t);
    case g.NANOSECOND:
      return Er(i, t);
  }
}, Nr = ({ values: i }, t) => i[t], Rr = ({ values: i }, t) => i[t], Lr = ({ values: i }, t) => i[t], Ur = ({ values: i }, t) => i[t], Sa = (i, t) => {
  switch (i.type.unit) {
    case g.SECOND:
      return Nr(i, t);
    case g.MILLISECOND:
      return Rr(i, t);
    case g.MICROSECOND:
      return Lr(i, t);
    case g.NANOSECOND:
      return Ur(i, t);
  }
}, Ba = ({ values: i, stride: t }, e) => _n.decimal(i.subarray(t * e, t * (e + 1))), Aa = (i, t) => {
  const { valueOffsets: e, stride: n, children: s } = i, { [t * n]: r, [t * n + 1]: o } = e, c = s[0].slice(r, o - r);
  return new R([c]);
}, Ta = (i, t) => {
  const { valueOffsets: e, children: n } = i, { [t]: s, [t + 1]: r } = e, o = n[0];
  return new wn(o.slice(s, r - s));
}, Da = (i, t) => new bn(i, t), Fa = (i, t) => i.type.mode === J.Dense ? Mr(i, t) : Cr(i, t), Mr = (i, t) => {
  const e = i.type.typeIdToChildIndex[i.typeIds[t]], n = i.children[e];
  return ot.visit(n, i.valueOffsets[t]);
}, Cr = (i, t) => {
  const e = i.type.typeIdToChildIndex[i.typeIds[t]], n = i.children[e];
  return ot.visit(n, t);
}, Oa = (i, t) => {
  var e;
  return (e = i.dictionary) === null || e === void 0 ? void 0 : e.get(i.values[t]);
}, Ea = (i, t) => i.type.unit === Et.DAY_TIME ? Pr(i, t) : kr(i, t), Pr = ({ values: i }, t) => i.subarray(2 * t, 2 * (t + 1)), kr = ({ values: i }, t) => {
  const e = i[t], n = new Int32Array(2);
  return n[0] = Math.trunc(e / 12), n[1] = Math.trunc(e % 12), n;
}, xr = ({ values: i }, t) => i[t], zr = ({ values: i }, t) => i[t], Vr = ({ values: i }, t) => i[t], jr = ({ values: i }, t) => i[t], Na = (i, t) => {
  switch (i.type.unit) {
    case g.SECOND:
      return xr(i, t);
    case g.MILLISECOND:
      return zr(i, t);
    case g.MICROSECOND:
      return Vr(i, t);
    case g.NANOSECOND:
      return jr(i, t);
  }
}, Ra = (i, t) => {
  const { stride: e, children: n } = i, r = n[0].slice(t * e, e);
  return new R([r]);
};
y.prototype.visitNull = w(pa);
y.prototype.visitBool = w(ma);
y.prototype.visitInt = w(ba);
y.prototype.visitInt8 = w(Qt);
y.prototype.visitInt16 = w(Qt);
y.prototype.visitInt32 = w(Qt);
y.prototype.visitInt64 = w(Br);
y.prototype.visitUint8 = w(Qt);
y.prototype.visitUint16 = w(Qt);
y.prototype.visitUint32 = w(Qt);
y.prototype.visitUint64 = w(Br);
y.prototype.visitFloat = w(wa);
y.prototype.visitFloat16 = w(_a);
y.prototype.visitFloat32 = w(Qt);
y.prototype.visitFloat64 = w(Qt);
y.prototype.visitUtf8 = w(Tr);
y.prototype.visitLargeUtf8 = w(Tr);
y.prototype.visitBinary = w(Ar);
y.prototype.visitLargeBinary = w(Ar);
y.prototype.visitFixedSizeBinary = w(ga);
y.prototype.visitDate = w(va);
y.prototype.visitDateDay = w(Ir);
y.prototype.visitDateMillisecond = w(Sr);
y.prototype.visitTimestamp = w(Ia);
y.prototype.visitTimestampSecond = w(Dr);
y.prototype.visitTimestampMillisecond = w(Fr);
y.prototype.visitTimestampMicrosecond = w(Or);
y.prototype.visitTimestampNanosecond = w(Er);
y.prototype.visitTime = w(Sa);
y.prototype.visitTimeSecond = w(Nr);
y.prototype.visitTimeMillisecond = w(Rr);
y.prototype.visitTimeMicrosecond = w(Lr);
y.prototype.visitTimeNanosecond = w(Ur);
y.prototype.visitDecimal = w(Ba);
y.prototype.visitList = w(Aa);
y.prototype.visitStruct = w(Da);
y.prototype.visitUnion = w(Fa);
y.prototype.visitDenseUnion = w(Mr);
y.prototype.visitSparseUnion = w(Cr);
y.prototype.visitDictionary = w(Oa);
y.prototype.visitInterval = w(Ea);
y.prototype.visitIntervalDayTime = w(Pr);
y.prototype.visitIntervalYearMonth = w(kr);
y.prototype.visitDuration = w(Na);
y.prototype.visitDurationSecond = w(xr);
y.prototype.visitDurationMillisecond = w(zr);
y.prototype.visitDurationMicrosecond = w(Vr);
y.prototype.visitDurationNanosecond = w(jr);
y.prototype.visitFixedSizeList = w(Ra);
y.prototype.visitMap = w(Ta);
const ot = new y(), he = Symbol.for("keys"), ge = Symbol.for("vals"), fe = Symbol.for("kKeysAsStrings"), on = Symbol.for("_kKeysAsStrings");
class wn {
  constructor(t) {
    return this[he] = new R([t.children[0]]).memoize(), this[ge] = t.children[1], new Proxy(this, new Ua());
  }
  /** @ignore */
  get [fe]() {
    return this[on] || (this[on] = Array.from(this[he].toArray(), String));
  }
  [Symbol.iterator]() {
    return new La(this[he], this[ge]);
  }
  get size() {
    return this[he].length;
  }
  toArray() {
    return Object.values(this.toJSON());
  }
  toJSON() {
    const t = this[he], e = this[ge], n = {};
    for (let s = -1, r = t.length; ++s < r; )
      n[t.get(s)] = ot.visit(e, s);
    return n;
  }
  toString() {
    return `{${[...this].map(([t, e]) => `${Pe(t)}: ${Pe(e)}`).join(", ")}}`;
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toString();
  }
}
class La {
  constructor(t, e) {
    this.keys = t, this.vals = e, this.keyIndex = 0, this.numKeys = t.length;
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    const t = this.keyIndex;
    return t === this.numKeys ? { done: !0, value: null } : (this.keyIndex++, {
      done: !1,
      value: [
        this.keys.get(t),
        ot.visit(this.vals, t)
      ]
    });
  }
}
class Ua {
  isExtensible() {
    return !1;
  }
  deleteProperty() {
    return !1;
  }
  preventExtensions() {
    return !0;
  }
  ownKeys(t) {
    return t[fe];
  }
  has(t, e) {
    return t[fe].includes(e);
  }
  getOwnPropertyDescriptor(t, e) {
    if (t[fe].indexOf(e) !== -1)
      return { writable: !0, enumerable: !0, configurable: !0 };
  }
  get(t, e) {
    if (Reflect.has(t, e))
      return t[e];
    const n = t[fe].indexOf(e);
    if (n !== -1) {
      const s = ot.visit(Reflect.get(t, ge), n);
      return Reflect.set(t, e, s), s;
    }
  }
  set(t, e, n) {
    const s = t[fe].indexOf(e);
    return s !== -1 ? (mt.visit(Reflect.get(t, ge), s, n), Reflect.set(t, e, n)) : Reflect.has(t, e) ? Reflect.set(t, e, n) : !1;
  }
}
Object.defineProperties(wn.prototype, {
  [Symbol.toStringTag]: { enumerable: !1, configurable: !1, value: "Row" },
  [he]: { writable: !0, enumerable: !1, configurable: !1, value: null },
  [ge]: { writable: !0, enumerable: !1, configurable: !1, value: null },
  [on]: { writable: !0, enumerable: !1, configurable: !1, value: null }
});
let ts;
function $r(i, t, e, n) {
  const { length: s = 0 } = i;
  let r = typeof t != "number" ? 0 : t, o = typeof e != "number" ? s : e;
  return r < 0 && (r = (r % s + s) % s), o < 0 && (o = (o % s + s) % s), o < r && (ts = r, r = o, o = ts), o > s && (o = s), n ? n(i, r, o) : [r, o];
}
const vn = (i, t) => i < 0 ? t + i : i, es = (i) => i !== i;
function Ae(i) {
  if (typeof i !== "object" || i === null)
    return es(i) ? es : (e) => e === i;
  if (i instanceof Date) {
    const e = i.valueOf();
    return (n) => n instanceof Date ? n.valueOf() === e : !1;
  }
  return ArrayBuffer.isView(i) ? (e) => e ? Ro(i, e) : !1 : i instanceof Map ? Ca(i) : Array.isArray(i) ? Ma(i) : i instanceof R ? Pa(i) : ka(i, !0);
}
function Ma(i) {
  const t = [];
  for (let e = -1, n = i.length; ++e < n; )
    t[e] = Ae(i[e]);
  return zi(t);
}
function Ca(i) {
  let t = -1;
  const e = [];
  for (const n of i.values())
    e[++t] = Ae(n);
  return zi(e);
}
function Pa(i) {
  const t = [];
  for (let e = -1, n = i.length; ++e < n; )
    t[e] = Ae(i.get(e));
  return zi(t);
}
function ka(i, t = !1) {
  const e = Object.keys(i);
  if (!t && e.length === 0)
    return () => !1;
  const n = [];
  for (let s = -1, r = e.length; ++s < r; )
    n[s] = Ae(i[e[s]]);
  return zi(n, e);
}
function zi(i, t) {
  return (e) => {
    if (!e || typeof e != "object")
      return !1;
    switch (e.constructor) {
      case Array:
        return xa(i, e);
      case Map:
        return is(i, e, e.keys());
      case wn:
      case bn:
      case Object:
      case void 0:
        return is(i, e, t || Object.keys(e));
    }
    return e instanceof R ? za(i, e) : !1;
  };
}
function xa(i, t) {
  const e = i.length;
  if (t.length !== e)
    return !1;
  for (let n = -1; ++n < e; )
    if (!i[n](t[n]))
      return !1;
  return !0;
}
function za(i, t) {
  const e = i.length;
  if (t.length !== e)
    return !1;
  for (let n = -1; ++n < e; )
    if (!i[n](t.get(n)))
      return !1;
  return !0;
}
function is(i, t, e) {
  const n = e[Symbol.iterator](), s = t instanceof Map ? t.keys() : Object.keys(t)[Symbol.iterator](), r = t instanceof Map ? t.values() : Object.values(t)[Symbol.iterator]();
  let o = 0;
  const a = i.length;
  let c = r.next(), u = n.next(), d = s.next();
  for (; o < a && !u.done && !d.done && !c.done && !(u.value !== d.value || !i[o](c.value)); ++o, u = n.next(), d = s.next(), c = r.next())
    ;
  return o === a && u.done && d.done && c.done ? !0 : (n.return && n.return(), s.return && s.return(), r.return && r.return(), !1);
}
function Yr(i, t, e, n) {
  return (e & 1 << n) !== 0;
}
function Va(i, t, e, n) {
  return (e & 1 << n) >> n;
}
function Fi(i, t, e) {
  const n = e.byteLength + 7 & -8;
  if (i > 0 || e.byteLength < n) {
    const s = new Uint8Array(n);
    return s.set(i % 8 === 0 ? e.subarray(i >> 3) : (
      // Otherwise iterate each bit from the offset and return a new one
      Oi(new In(e, i, t, null, Yr)).subarray(0, n)
    )), s;
  }
  return e;
}
function Oi(i) {
  const t = [];
  let e = 0, n = 0, s = 0;
  for (const o of i)
    o && (s |= 1 << n), ++n === 8 && (t[e++] = s, s = n = 0);
  (e === 0 || n > 0) && (t[e++] = s);
  const r = new Uint8Array(t.length + 7 & -8);
  return r.set(t), r;
}
class In {
  constructor(t, e, n, s, r) {
    this.bytes = t, this.length = n, this.context = s, this.get = r, this.bit = e % 8, this.byteIndex = e >> 3, this.byte = t[this.byteIndex++], this.index = 0;
  }
  next() {
    return this.index < this.length ? (this.bit === 8 && (this.bit = 0, this.byte = this.bytes[this.byteIndex++]), {
      value: this.get(this.context, this.index++, this.byte, this.bit++)
    }) : { done: !0, value: null };
  }
  [Symbol.iterator]() {
    return this;
  }
}
function an(i, t, e) {
  if (e - t <= 0)
    return 0;
  if (e - t < 8) {
    let r = 0;
    for (const o of new In(i, t, e - t, i, Va))
      r += o;
    return r;
  }
  const n = e >> 3 << 3, s = t + (t % 8 === 0 ? 0 : 8 - t % 8);
  return (
    // Get the popcnt of bits between the left hand side, and the next highest multiple of 8
    an(i, t, s) + // Get the popcnt of bits between the right hand side, and the next lowest multiple of 8
    an(i, n, e) + // Get the popcnt of all bits between the left and right hand sides' multiples of 8
    ja(i, s >> 3, n - s >> 3)
  );
}
function ja(i, t, e) {
  let n = 0, s = Math.trunc(t);
  const r = new DataView(i.buffer, i.byteOffset, i.byteLength), o = e === void 0 ? i.byteLength : s + e;
  for (; o - s >= 4; )
    n += Hi(r.getUint32(s)), s += 4;
  for (; o - s >= 2; )
    n += Hi(r.getUint16(s)), s += 2;
  for (; o - s >= 1; )
    n += Hi(r.getUint8(s)), s += 1;
  return n;
}
function Hi(i) {
  let t = Math.trunc(i);
  return t = t - (t >>> 1 & 1431655765), t = (t & 858993459) + (t >>> 2 & 858993459), (t + (t >>> 4) & 252645135) * 16843009 >>> 24;
}
const $a = -1;
class M {
  get typeId() {
    return this.type.typeId;
  }
  get ArrayType() {
    return this.type.ArrayType;
  }
  get buffers() {
    return [this.valueOffsets, this.values, this.nullBitmap, this.typeIds];
  }
  get nullable() {
    if (this._nullCount !== 0) {
      const { type: t } = this;
      return f.isSparseUnion(t) ? this.children.some((e) => e.nullable) : f.isDenseUnion(t) ? this.children.some((e) => e.nullable) : this.nullBitmap && this.nullBitmap.byteLength > 0;
    }
    return !0;
  }
  get byteLength() {
    let t = 0;
    const { valueOffsets: e, values: n, nullBitmap: s, typeIds: r } = this;
    return e && (t += e.byteLength), n && (t += n.byteLength), s && (t += s.byteLength), r && (t += r.byteLength), this.children.reduce((o, a) => o + a.byteLength, t);
  }
  get nullCount() {
    if (f.isUnion(this.type))
      return this.children.reduce((n, s) => n + s.nullCount, 0);
    let t = this._nullCount, e;
    return t <= $a && (e = this.nullBitmap) && (this._nullCount = t = e.length === 0 ? (
      // no null bitmap, so all values are valid
      0
    ) : this.length - an(e, this.offset, this.offset + this.length)), t;
  }
  constructor(t, e, n, s, r, o = [], a) {
    this.type = t, this.children = o, this.dictionary = a, this.offset = Math.floor(Math.max(e || 0, 0)), this.length = Math.floor(Math.max(n || 0, 0)), this._nullCount = Math.floor(Math.max(s || 0, -1));
    let c;
    r instanceof M ? (this.stride = r.stride, this.values = r.values, this.typeIds = r.typeIds, this.nullBitmap = r.nullBitmap, this.valueOffsets = r.valueOffsets) : (this.stride = Mt(t), r && ((c = r[0]) && (this.valueOffsets = c), (c = r[1]) && (this.values = c), (c = r[2]) && (this.nullBitmap = c), (c = r[3]) && (this.typeIds = c)));
  }
  getValid(t) {
    const { type: e } = this;
    if (f.isUnion(e)) {
      const n = e, s = this.children[n.typeIdToChildIndex[this.typeIds[t]]], r = n.mode === J.Dense ? this.valueOffsets[t] : t;
      return s.getValid(r);
    }
    if (this.nullable && this.nullCount > 0) {
      const n = this.offset + t;
      return (this.nullBitmap[n >> 3] & 1 << n % 8) !== 0;
    }
    return !0;
  }
  setValid(t, e) {
    let n;
    const { type: s } = this;
    if (f.isUnion(s)) {
      const r = s, o = this.children[r.typeIdToChildIndex[this.typeIds[t]]], a = r.mode === J.Dense ? this.valueOffsets[t] : t;
      n = o.getValid(a), o.setValid(a, e);
    } else {
      let { nullBitmap: r } = this;
      const { offset: o, length: a } = this, c = o + t, u = 1 << c % 8, d = c >> 3;
      (!r || r.byteLength <= d) && (r = new Uint8Array((o + a + 63 & -64) >> 3).fill(255), this.nullCount > 0 ? (r.set(Fi(o, a, this.nullBitmap), 0), Object.assign(this, { nullBitmap: r })) : Object.assign(this, { nullBitmap: r, _nullCount: 0 }));
      const h = r[d];
      n = (h & u) !== 0, r[d] = e ? h | u : h & ~u;
    }
    return n !== !!e && (this._nullCount = this.nullCount + (e ? -1 : 1)), e;
  }
  clone(t = this.type, e = this.offset, n = this.length, s = this._nullCount, r = this, o = this.children) {
    return new M(t, e, n, s, r, o, this.dictionary);
  }
  slice(t, e) {
    const { stride: n, typeId: s, children: r } = this, o = +(this._nullCount === 0) - 1, a = s === 16 ? n : 1, c = this._sliceBuffers(t, e, n, s);
    return this.clone(
      this.type,
      this.offset + t,
      e,
      o,
      c,
      // Don't slice children if we have value offsets (the variable-width types)
      r.length === 0 || this.valueOffsets ? r : this._sliceChildren(r, a * t, a * e)
    );
  }
  _changeLengthAndBackfillNullBitmap(t) {
    if (this.typeId === l.Null)
      return this.clone(this.type, 0, t, 0);
    const { length: e, nullCount: n } = this, s = new Uint8Array((t + 63 & -64) >> 3).fill(255, 0, e >> 3);
    s[e >> 3] = (1 << e - (e & -8)) - 1, n > 0 && s.set(Fi(this.offset, e, this.nullBitmap), 0);
    const r = this.buffers;
    return r[Ut.VALIDITY] = s, this.clone(this.type, 0, t, n + (t - e), r);
  }
  _sliceBuffers(t, e, n, s) {
    let r;
    const { buffers: o } = this;
    return (r = o[Ut.TYPE]) && (o[Ut.TYPE] = r.subarray(t, t + e)), (r = o[Ut.OFFSET]) && (o[Ut.OFFSET] = r.subarray(t, t + e + 1)) || // Otherwise if no offsets, slice the data buffer. Don't slice the data vector for Booleans, since the offset goes by bits not bytes
    (r = o[Ut.DATA]) && (o[Ut.DATA] = s === 6 ? r : r.subarray(n * t, n * (t + e))), o;
  }
  _sliceChildren(t, e, n) {
    return t.map((s) => s.slice(e, n));
  }
}
M.prototype.children = Object.freeze([]);
class Ce extends T {
  visit(t) {
    return this.getVisitFn(t.type).call(this, t);
  }
  visitNull(t) {
    const { ["type"]: e, ["offset"]: n = 0, ["length"]: s = 0 } = t;
    return new M(e, n, s, s);
  }
  visitBool(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length >> 3, ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitInt(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length, ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitFloat(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length, ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitUtf8(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.data), r = O(t.nullBitmap), o = De(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, s, r]);
  }
  visitLargeUtf8(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.data), r = O(t.nullBitmap), o = $n(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, s, r]);
  }
  visitBinary(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.data), r = O(t.nullBitmap), o = De(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, s, r]);
  }
  visitLargeBinary(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.data), r = O(t.nullBitmap), o = $n(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, s, r]);
  }
  visitFixedSizeBinary(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length / Mt(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitDate(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length / Mt(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitTimestamp(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length / Mt(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitTime(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length / Mt(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitDecimal(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length / Mt(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitList(t) {
    const { ["type"]: e, ["offset"]: n = 0, ["child"]: s } = t, r = O(t.nullBitmap), o = De(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, void 0, r], [s]);
  }
  visitStruct(t) {
    const { ["type"]: e, ["offset"]: n = 0, ["children"]: s = [] } = t, r = O(t.nullBitmap), { length: o = s.reduce((c, { length: u }) => Math.max(c, u), 0), nullCount: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, void 0, r], s);
  }
  visitUnion(t) {
    const { ["type"]: e, ["offset"]: n = 0, ["children"]: s = [] } = t, r = P(e.ArrayType, t.typeIds), { ["length"]: o = r.length, ["nullCount"]: a = -1 } = t;
    if (f.isSparseUnion(e))
      return new M(e, n, o, a, [void 0, void 0, void 0, r], s);
    const c = De(t.valueOffsets);
    return new M(e, n, o, a, [c, void 0, void 0, r], s);
  }
  visitDictionary(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.indices.ArrayType, t.data), { ["dictionary"]: o = new R([new Ce().visit({ type: e.dictionary })]) } = t, { ["length"]: a = r.length, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [void 0, r, s], [], o);
  }
  visitInterval(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length / Mt(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitDuration(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length, ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitFixedSizeList(t) {
    const { ["type"]: e, ["offset"]: n = 0, ["child"]: s = new Ce().visit({ type: e.valueType }) } = t, r = O(t.nullBitmap), { ["length"]: o = s.length / Mt(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, void 0, r], [s]);
  }
  visitMap(t) {
    const { ["type"]: e, ["offset"]: n = 0, ["child"]: s = new Ce().visit({ type: e.childType }) } = t, r = O(t.nullBitmap), o = De(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, void 0, r], [s]);
  }
}
const Ya = new Ce();
function D(i) {
  return Ya.visit(i);
}
class ns {
  constructor(t = 0, e) {
    this.numChunks = t, this.getChunkIterator = e, this.chunkIndex = 0, this.chunkIterator = this.getChunkIterator(0);
  }
  next() {
    for (; this.chunkIndex < this.numChunks; ) {
      const t = this.chunkIterator.next();
      if (!t.done)
        return t;
      ++this.chunkIndex < this.numChunks && (this.chunkIterator = this.getChunkIterator(this.chunkIndex));
    }
    return { done: !0, value: null };
  }
  [Symbol.iterator]() {
    return this;
  }
}
function Wa(i) {
  return i.some((t) => t.nullable);
}
function Wr(i) {
  return i.reduce((t, e) => t + e.nullCount, 0);
}
function Gr(i) {
  return i.reduce((t, e, n) => (t[n + 1] = t[n] + e.length, t), new Uint32Array(i.length + 1));
}
function Hr(i, t, e, n) {
  const s = [];
  for (let r = -1, o = i.length; ++r < o; ) {
    const a = i[r], c = t[r], { length: u } = a;
    if (c >= n)
      break;
    if (e >= c + u)
      continue;
    if (c >= e && c + u <= n) {
      s.push(a);
      continue;
    }
    const d = Math.max(0, e - c), h = Math.min(n - c, u);
    s.push(a.slice(d, h - d));
  }
  return s.length === 0 && s.push(i[0].slice(0, 0)), s;
}
function Sn(i, t, e, n) {
  let s = 0, r = 0, o = t.length - 1;
  do {
    if (s >= o - 1)
      return e < t[o] ? n(i, s, e - t[s]) : null;
    r = s + Math.trunc((o - s) * 0.5), e < t[r] ? o = r : s = r;
  } while (s < o);
}
function Bn(i, t) {
  return i.getValid(t);
}
function Ei(i) {
  function t(e, n, s) {
    return i(e[n], s);
  }
  return function(e) {
    const n = this.data;
    return Sn(n, this._offsets, e, t);
  };
}
function qr(i) {
  let t;
  function e(n, s, r) {
    return i(n[s], r, t);
  }
  return function(n, s) {
    const r = this.data;
    t = s;
    const o = Sn(r, this._offsets, n, e);
    return t = void 0, o;
  };
}
function Kr(i) {
  let t;
  function e(n, s, r) {
    let o = r, a = 0, c = 0;
    for (let u = s - 1, d = n.length; ++u < d; ) {
      const h = n[u];
      if (~(a = i(h, t, o)))
        return c + a;
      o = 0, c += h.length;
    }
    return -1;
  }
  return function(n, s) {
    t = n;
    const r = this.data, o = typeof s != "number" ? e(r, 0, 0) : Sn(r, this._offsets, s, e);
    return t = void 0, o;
  };
}
class p extends T {
}
function Ga(i, t) {
  return t === null && i.length > 0 ? 0 : -1;
}
function Ha(i, t) {
  const { nullBitmap: e } = i;
  if (!e || i.nullCount <= 0)
    return -1;
  let n = 0;
  for (const s of new In(e, i.offset + (t || 0), i.length, e, Yr)) {
    if (!s)
      return n;
    ++n;
  }
  return -1;
}
function S(i, t, e) {
  if (t === void 0)
    return -1;
  if (t === null)
    switch (i.typeId) {
      // Unions don't have a nullBitmap of its own, so compare the `searchElement` to `get()`.
      case l.Union:
        break;
      // Dictionaries do have a nullBitmap, but their dictionary could also have null elements.
      case l.Dictionary:
        break;
      // All other types can iterate the null bitmap
      default:
        return Ha(i, e);
    }
  const n = ot.getVisitFn(i), s = Ae(t);
  for (let r = (e || 0) - 1, o = i.length; ++r < o; )
    if (s(n(i, r)))
      return r;
  return -1;
}
function Qr(i, t, e) {
  const n = ot.getVisitFn(i), s = Ae(t);
  for (let r = (e || 0) - 1, o = i.length; ++r < o; )
    if (s(n(i, r)))
      return r;
  return -1;
}
p.prototype.visitNull = Ga;
p.prototype.visitBool = S;
p.prototype.visitInt = S;
p.prototype.visitInt8 = S;
p.prototype.visitInt16 = S;
p.prototype.visitInt32 = S;
p.prototype.visitInt64 = S;
p.prototype.visitUint8 = S;
p.prototype.visitUint16 = S;
p.prototype.visitUint32 = S;
p.prototype.visitUint64 = S;
p.prototype.visitFloat = S;
p.prototype.visitFloat16 = S;
p.prototype.visitFloat32 = S;
p.prototype.visitFloat64 = S;
p.prototype.visitUtf8 = S;
p.prototype.visitLargeUtf8 = S;
p.prototype.visitBinary = S;
p.prototype.visitLargeBinary = S;
p.prototype.visitFixedSizeBinary = S;
p.prototype.visitDate = S;
p.prototype.visitDateDay = S;
p.prototype.visitDateMillisecond = S;
p.prototype.visitTimestamp = S;
p.prototype.visitTimestampSecond = S;
p.prototype.visitTimestampMillisecond = S;
p.prototype.visitTimestampMicrosecond = S;
p.prototype.visitTimestampNanosecond = S;
p.prototype.visitTime = S;
p.prototype.visitTimeSecond = S;
p.prototype.visitTimeMillisecond = S;
p.prototype.visitTimeMicrosecond = S;
p.prototype.visitTimeNanosecond = S;
p.prototype.visitDecimal = S;
p.prototype.visitList = S;
p.prototype.visitStruct = S;
p.prototype.visitUnion = S;
p.prototype.visitDenseUnion = Qr;
p.prototype.visitSparseUnion = Qr;
p.prototype.visitDictionary = S;
p.prototype.visitInterval = S;
p.prototype.visitIntervalDayTime = S;
p.prototype.visitIntervalYearMonth = S;
p.prototype.visitDuration = S;
p.prototype.visitDurationSecond = S;
p.prototype.visitDurationMillisecond = S;
p.prototype.visitDurationMicrosecond = S;
p.prototype.visitDurationNanosecond = S;
p.prototype.visitFixedSizeList = S;
p.prototype.visitMap = S;
const Ni = new p();
class m extends T {
}
function v(i) {
  const { type: t } = i;
  if (i.nullCount === 0 && i.stride === 1 && // Don't defer to native iterator for timestamps since Numbers are expected
  // (DataType.isTimestamp(type)) && type.unit === TimeUnit.MILLISECOND ||
  (f.isInt(t) && t.bitWidth !== 64 || f.isTime(t) && t.bitWidth !== 64 || f.isFloat(t) && t.precision !== Q.HALF))
    return new ns(i.data.length, (n) => {
      const s = i.data[n];
      return s.values.subarray(0, s.length)[Symbol.iterator]();
    });
  let e = 0;
  return new ns(i.data.length, (n) => {
    const r = i.data[n].length, o = i.slice(e, e + r);
    return e += r, new qa(o);
  });
}
class qa {
  constructor(t) {
    this.vector = t, this.index = 0;
  }
  next() {
    return this.index < this.vector.length ? {
      value: this.vector.get(this.index++)
    } : { done: !0, value: null };
  }
  [Symbol.iterator]() {
    return this;
  }
}
m.prototype.visitNull = v;
m.prototype.visitBool = v;
m.prototype.visitInt = v;
m.prototype.visitInt8 = v;
m.prototype.visitInt16 = v;
m.prototype.visitInt32 = v;
m.prototype.visitInt64 = v;
m.prototype.visitUint8 = v;
m.prototype.visitUint16 = v;
m.prototype.visitUint32 = v;
m.prototype.visitUint64 = v;
m.prototype.visitFloat = v;
m.prototype.visitFloat16 = v;
m.prototype.visitFloat32 = v;
m.prototype.visitFloat64 = v;
m.prototype.visitUtf8 = v;
m.prototype.visitLargeUtf8 = v;
m.prototype.visitBinary = v;
m.prototype.visitLargeBinary = v;
m.prototype.visitFixedSizeBinary = v;
m.prototype.visitDate = v;
m.prototype.visitDateDay = v;
m.prototype.visitDateMillisecond = v;
m.prototype.visitTimestamp = v;
m.prototype.visitTimestampSecond = v;
m.prototype.visitTimestampMillisecond = v;
m.prototype.visitTimestampMicrosecond = v;
m.prototype.visitTimestampNanosecond = v;
m.prototype.visitTime = v;
m.prototype.visitTimeSecond = v;
m.prototype.visitTimeMillisecond = v;
m.prototype.visitTimeMicrosecond = v;
m.prototype.visitTimeNanosecond = v;
m.prototype.visitDecimal = v;
m.prototype.visitList = v;
m.prototype.visitStruct = v;
m.prototype.visitUnion = v;
m.prototype.visitDenseUnion = v;
m.prototype.visitSparseUnion = v;
m.prototype.visitDictionary = v;
m.prototype.visitInterval = v;
m.prototype.visitIntervalDayTime = v;
m.prototype.visitIntervalYearMonth = v;
m.prototype.visitDuration = v;
m.prototype.visitDurationSecond = v;
m.prototype.visitDurationMillisecond = v;
m.prototype.visitDurationMicrosecond = v;
m.prototype.visitDurationNanosecond = v;
m.prototype.visitFixedSizeList = v;
m.prototype.visitMap = v;
const An = new m();
var Jr;
const Zr = {}, Xr = {};
class R {
  constructor(t) {
    var e, n, s;
    const r = t[0] instanceof R ? t.flatMap((a) => a.data) : t;
    if (r.length === 0 || r.some((a) => !(a instanceof M)))
      throw new TypeError("Vector constructor expects an Array of Data instances.");
    const o = (e = r[0]) === null || e === void 0 ? void 0 : e.type;
    switch (r.length) {
      case 0:
        this._offsets = [0];
        break;
      case 1: {
        const { get: a, set: c, indexOf: u } = Zr[o.typeId], d = r[0];
        this.isValid = (h) => Bn(d, h), this.get = (h) => a(d, h), this.set = (h, V) => c(d, h, V), this.indexOf = (h) => u(d, h), this._offsets = [0, d.length];
        break;
      }
      default:
        Object.setPrototypeOf(this, Xr[o.typeId]), this._offsets = Gr(r);
        break;
    }
    this.data = r, this.type = o, this.stride = Mt(o), this.numChildren = (s = (n = o.children) === null || n === void 0 ? void 0 : n.length) !== null && s !== void 0 ? s : 0, this.length = this._offsets.at(-1);
  }
  /**
   * The aggregate size (in bytes) of this Vector's buffers and/or child Vectors.
   */
  get byteLength() {
    return this.data.reduce((t, e) => t + e.byteLength, 0);
  }
  /**
   * Whether this Vector's elements can contain null values.
   */
  get nullable() {
    return Wa(this.data);
  }
  /**
   * The number of null elements in this Vector.
   */
  get nullCount() {
    return Wr(this.data);
  }
  /**
   * The Array or TypedArray constructor used for the JS representation
   *  of the element's values in {@link Vector.prototype.toArray `toArray()`}.
   */
  get ArrayType() {
    return this.type.ArrayType;
  }
  /**
   * The name that should be printed when the Vector is logged in a message.
   */
  get [Symbol.toStringTag]() {
    return `${this.VectorName}<${this.type[Symbol.toStringTag]}>`;
  }
  /**
   * The name of this Vector.
   */
  get VectorName() {
    return `${l[this.type.typeId]}Vector`;
  }
  /**
   * Check whether an element is null.
   * @param index The index at which to read the validity bitmap.
   */
  // @ts-ignore
  isValid(t) {
    return !1;
  }
  /**
   * Get an element value by position.
   * @param index The index of the element to read.
   */
  // @ts-ignore
  get(t) {
    return null;
  }
  /**
   * Get an element value by position.
   * @param index The index of the element to read. A negative index will count back from the last element.
   */
  at(t) {
    return this.get(vn(t, this.length));
  }
  /**
   * Set an element value by position.
   * @param index The index of the element to write.
   * @param value The value to set.
   */
  // @ts-ignore
  set(t, e) {
  }
  /**
   * Retrieve the index of the first occurrence of a value in an Vector.
   * @param element The value to locate in the Vector.
   * @param offset The index at which to begin the search. If offset is omitted, the search starts at index 0.
   */
  // @ts-ignore
  indexOf(t, e) {
    return -1;
  }
  includes(t, e) {
    return this.indexOf(t, e) > -1;
  }
  /**
   * Iterator for the Vector's elements.
   */
  [Symbol.iterator]() {
    return An.visit(this);
  }
  /**
   * Combines two or more Vectors of the same type.
   * @param others Additional Vectors to add to the end of this Vector.
   */
  concat(...t) {
    return new R(this.data.concat(t.flatMap((e) => e.data).flat(Number.POSITIVE_INFINITY)));
  }
  /**
   * Return a zero-copy sub-section of this Vector.
   * @param start The beginning of the specified portion of the Vector.
   * @param end The end of the specified portion of the Vector. This is exclusive of the element at the index 'end'.
   */
  slice(t, e) {
    return new R($r(this, t, e, ({ data: n, _offsets: s }, r, o) => Hr(n, s, r, o)));
  }
  toJSON() {
    return [...this];
  }
  /**
   * Return a JavaScript Array or TypedArray of the Vector's elements.
   *
   * @note If this Vector contains a single Data chunk and the Vector's type is a
   *  primitive numeric type corresponding to one of the JavaScript TypedArrays, this
   *  method returns a zero-copy slice of the underlying TypedArray values. If there's
   *  more than one chunk, the resulting TypedArray will be a copy of the data from each
   *  chunk's underlying TypedArray values.
   *
   * @returns An Array or TypedArray of the Vector's elements, based on the Vector's DataType.
   */
  toArray() {
    const { type: t, data: e, length: n, stride: s, ArrayType: r } = this;
    switch (t.typeId) {
      case l.Int:
      case l.Float:
      case l.Decimal:
      case l.Time:
      case l.Timestamp:
        switch (e.length) {
          case 0:
            return new r();
          case 1:
            return e[0].values.subarray(0, n * s);
          default:
            return e.reduce((o, { values: a, length: c }) => (o.array.set(a.subarray(0, c * s), o.offset), o.offset += c * s, o), { array: new r(n * s), offset: 0 }).array;
        }
    }
    return [...this];
  }
  /**
   * Returns a string representation of the Vector.
   *
   * @returns A string representation of the Vector.
   */
  toString() {
    return `[${[...this].join(",")}]`;
  }
  /**
   * Returns a child Vector by name, or null if this Vector has no child with the given name.
   * @param name The name of the child to retrieve.
   */
  getChild(t) {
    var e;
    return this.getChildAt((e = this.type.children) === null || e === void 0 ? void 0 : e.findIndex((n) => n.name === t));
  }
  /**
   * Returns a child Vector by index, or null if this Vector has no child at the supplied index.
   * @param index The index of the child to retrieve.
   */
  getChildAt(t) {
    return t > -1 && t < this.numChildren ? new R(this.data.map(({ children: e }) => e[t])) : null;
  }
  get isMemoized() {
    return f.isDictionary(this.type) ? this.data[0].dictionary.isMemoized : !1;
  }
  /**
   * Adds memoization to the Vector's {@link get} method. For dictionary
   * vectors, this method return a vector that memoizes only the dictionary
   * values.
   *
   * Memoization is very useful when decoding a value is expensive such as
   * Utf8. The memoization creates a cache of the size of the Vector and
   * therefore increases memory usage.
   *
   * @returns A new vector that memoizes calls to {@link get}.
   */
  memoize() {
    if (f.isDictionary(this.type)) {
      const t = new Ri(this.data[0].dictionary), e = this.data.map((n) => {
        const s = n.clone();
        return s.dictionary = t, s;
      });
      return new R(e);
    }
    return new Ri(this);
  }
  /**
   * Returns a vector without memoization of the {@link get} method. If this
   * vector is not memoized, this method returns this vector.
   *
   * @returns A new vector without memoization.
   */
  unmemoize() {
    if (f.isDictionary(this.type) && this.isMemoized) {
      const t = this.data[0].dictionary.unmemoize(), e = this.data.map((n) => {
        const s = n.clone();
        return s.dictionary = t, s;
      });
      return new R(e);
    }
    return this;
  }
}
Jr = Symbol.toStringTag;
R[Jr] = ((i) => {
  i.type = f.prototype, i.data = [], i.length = 0, i.stride = 1, i.numChildren = 0, i._offsets = new Uint32Array([0]), i[Symbol.isConcatSpreadable] = !0;
  const t = Object.keys(l).map((e) => l[e]).filter((e) => typeof e == "number" && e !== l.NONE);
  for (const e of t) {
    const n = ot.getVisitFnByTypeId(e), s = mt.getVisitFnByTypeId(e), r = Ni.getVisitFnByTypeId(e);
    Zr[e] = { get: n, set: s, indexOf: r }, Xr[e] = Object.create(i, {
      isValid: { value: Ei(Bn) },
      get: { value: Ei(ot.getVisitFnByTypeId(e)) },
      set: { value: qr(mt.getVisitFnByTypeId(e)) },
      indexOf: { value: Kr(Ni.getVisitFnByTypeId(e)) }
    });
  }
  return "Vector";
})(R.prototype);
class Ri extends R {
  constructor(t) {
    super(t.data);
    const e = this.get, n = this.set, s = this.slice, r = new Array(this.length);
    Object.defineProperty(this, "get", {
      value(o) {
        const a = r[o];
        if (a !== void 0)
          return a;
        const c = e.call(this, o);
        return r[o] = c, c;
      }
    }), Object.defineProperty(this, "set", {
      value(o, a) {
        n.call(this, o, a), r[o] = a;
      }
    }), Object.defineProperty(this, "slice", {
      value: (o, a) => new Ri(s.call(this, o, a))
    }), Object.defineProperty(this, "isMemoized", { value: !0 }), Object.defineProperty(this, "unmemoize", {
      value: () => new R(this.data)
    }), Object.defineProperty(this, "memoize", {
      value: () => this
    });
  }
}
class cn {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  /**
   * Index to the start of the RecordBlock (note this is past the Message header)
   */
  offset() {
    return this.bb.readInt64(this.bb_pos);
  }
  /**
   * Length of the metadata
   */
  metaDataLength() {
    return this.bb.readInt32(this.bb_pos + 8);
  }
  /**
   * Length of the data (this is aligned so there can be a gap between this and
   * the metadata).
   */
  bodyLength() {
    return this.bb.readInt64(this.bb_pos + 16);
  }
  static sizeOf() {
    return 24;
  }
  static createBlock(t, e, n, s) {
    return t.prep(8, 24), t.writeInt64(BigInt(s ?? 0)), t.pad(4), t.writeInt32(n), t.writeInt64(BigInt(e ?? 0)), t.offset();
  }
}
class at {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsFooter(t, e) {
    return (e || new at()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsFooter(t, e) {
    return t.setPosition(t.position() + U), (e || new at()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  version() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : G.V1;
  }
  schema(t) {
    const e = this.bb.__offset(this.bb_pos, 6);
    return e ? (t || new It()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
  }
  dictionaries(t, e) {
    const n = this.bb.__offset(this.bb_pos, 8);
    return n ? (e || new cn()).__init(this.bb.__vector(this.bb_pos + n) + t * 24, this.bb) : null;
  }
  dictionariesLength() {
    const t = this.bb.__offset(this.bb_pos, 8);
    return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
  }
  recordBatches(t, e) {
    const n = this.bb.__offset(this.bb_pos, 10);
    return n ? (e || new cn()).__init(this.bb.__vector(this.bb_pos + n) + t * 24, this.bb) : null;
  }
  recordBatchesLength() {
    const t = this.bb.__offset(this.bb_pos, 10);
    return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
  }
  /**
   * User-defined metadata
   */
  customMetadata(t, e) {
    const n = this.bb.__offset(this.bb_pos, 12);
    return n ? (e || new q()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + n) + t * 4), this.bb) : null;
  }
  customMetadataLength() {
    const t = this.bb.__offset(this.bb_pos, 12);
    return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
  }
  static startFooter(t) {
    t.startObject(5);
  }
  static addVersion(t, e) {
    t.addFieldInt16(0, e, G.V1);
  }
  static addSchema(t, e) {
    t.addFieldOffset(1, e, 0);
  }
  static addDictionaries(t, e) {
    t.addFieldOffset(2, e, 0);
  }
  static startDictionariesVector(t, e) {
    t.startVector(24, e, 8);
  }
  static addRecordBatches(t, e) {
    t.addFieldOffset(3, e, 0);
  }
  static startRecordBatchesVector(t, e) {
    t.startVector(24, e, 8);
  }
  static addCustomMetadata(t, e) {
    t.addFieldOffset(4, e, 0);
  }
  static createCustomMetadataVector(t, e) {
    t.startVector(4, e.length, 4);
    for (let n = e.length - 1; n >= 0; n--)
      t.addOffset(e[n]);
    return t.endVector();
  }
  static startCustomMetadataVector(t, e) {
    t.startVector(4, e, 4);
  }
  static endFooter(t) {
    return t.endObject();
  }
  static finishFooterBuffer(t, e) {
    t.finish(e);
  }
  static finishSizePrefixedFooterBuffer(t, e) {
    t.finish(e, void 0, !0);
  }
}
class L {
  constructor(t = [], e, n, s = G.V5) {
    this.fields = t || [], this.metadata = e || /* @__PURE__ */ new Map(), n || (n = ln(this.fields)), this.dictionaries = n, this.metadataVersion = s;
  }
  get [Symbol.toStringTag]() {
    return "Schema";
  }
  get names() {
    return this.fields.map((t) => t.name);
  }
  toString() {
    return `Schema<{ ${this.fields.map((t, e) => `${e}: ${t}`).join(", ")} }>`;
  }
  /**
   * Construct a new Schema containing only specified fields.
   *
   * @param fieldNames Names of fields to keep.
   * @returns A new Schema of fields matching the specified names.
   */
  select(t) {
    const e = new Set(t), n = this.fields.filter((s) => e.has(s.name));
    return new L(n, this.metadata);
  }
  /**
   * Construct a new Schema containing only fields at the specified indices.
   *
   * @param fieldIndices Indices of fields to keep.
   * @returns A new Schema of fields at the specified indices.
   */
  selectAt(t) {
    const e = t.map((n) => this.fields[n]).filter(Boolean);
    return new L(e, this.metadata);
  }
  assign(...t) {
    const e = t[0] instanceof L ? t[0] : Array.isArray(t[0]) ? new L(t[0]) : new L(t), n = [...this.fields], s = Qe(Qe(/* @__PURE__ */ new Map(), this.metadata), e.metadata), r = e.fields.filter((a) => {
      const c = n.findIndex((u) => u.name === a.name);
      return ~c ? (n[c] = a.clone({
        metadata: Qe(Qe(/* @__PURE__ */ new Map(), n[c].metadata), a.metadata)
      })) && !1 : !0;
    }), o = ln(r, /* @__PURE__ */ new Map());
    return new L([...n, ...r], s, new Map([...this.dictionaries, ...o]));
  }
}
L.prototype.fields = null;
L.prototype.metadata = null;
L.prototype.dictionaries = null;
class z {
  /** @nocollapse */
  static new(...t) {
    let [e, n, s, r] = t;
    return t[0] && typeof t[0] == "object" && ({ name: e } = t[0], n === void 0 && (n = t[0].type), s === void 0 && (s = t[0].nullable), r === void 0 && (r = t[0].metadata)), new z(`${e}`, n, s, r);
  }
  constructor(t, e, n = !1, s) {
    this.name = t, this.type = e, this.nullable = n, this.metadata = s || /* @__PURE__ */ new Map();
  }
  get typeId() {
    return this.type.typeId;
  }
  get [Symbol.toStringTag]() {
    return "Field";
  }
  toString() {
    return `${this.name}: ${this.type}`;
  }
  clone(...t) {
    let [e, n, s, r] = t;
    return !t[0] || typeof t[0] != "object" ? [e = this.name, n = this.type, s = this.nullable, r = this.metadata] = t : { name: e = this.name, type: n = this.type, nullable: s = this.nullable, metadata: r = this.metadata } = t[0], z.new(e, n, s, r);
  }
}
z.prototype.type = null;
z.prototype.name = null;
z.prototype.nullable = null;
z.prototype.metadata = null;
function Qe(i, t) {
  return new Map([...i || /* @__PURE__ */ new Map(), ...t || /* @__PURE__ */ new Map()]);
}
function ln(i, t = /* @__PURE__ */ new Map()) {
  for (let e = -1, n = i.length; ++e < n; ) {
    const r = i[e].type;
    if (f.isDictionary(r)) {
      if (!t.has(r.id))
        t.set(r.id, r.dictionary);
      else if (t.get(r.id) !== r.dictionary)
        throw new Error("Cannot create Schema containing two different dictionaries with the same Id");
    }
    r.children && r.children.length > 0 && ln(r.children, t);
  }
  return t;
}
var Ka = Ss, Qa = be;
class Ve {
  /** @nocollapse */
  static decode(t) {
    t = new Qa(O(t));
    const e = at.getRootAsFooter(t), n = L.decode(e.schema(), /* @__PURE__ */ new Map(), e.version());
    return new Ja(n, e);
  }
  /** @nocollapse */
  static encode(t) {
    const e = new Ka(), n = L.encode(e, t.schema);
    at.startRecordBatchesVector(e, t.numRecordBatches);
    for (const o of [...t.recordBatches()].slice().reverse())
      Ht.encode(e, o);
    const s = e.endVector();
    at.startDictionariesVector(e, t.numDictionaries);
    for (const o of [...t.dictionaryBatches()].slice().reverse())
      Ht.encode(e, o);
    const r = e.endVector();
    return at.startFooter(e), at.addSchema(e, n), at.addVersion(e, G.V5), at.addRecordBatches(e, s), at.addDictionaries(e, r), at.finishFooterBuffer(e, at.endFooter(e)), e.asUint8Array();
  }
  get numRecordBatches() {
    return this._recordBatches.length;
  }
  get numDictionaries() {
    return this._dictionaryBatches.length;
  }
  constructor(t, e = G.V5, n, s) {
    this.schema = t, this.version = e, n && (this._recordBatches = n), s && (this._dictionaryBatches = s);
  }
  *recordBatches() {
    for (let t, e = -1, n = this.numRecordBatches; ++e < n; )
      (t = this.getRecordBatch(e)) && (yield t);
  }
  *dictionaryBatches() {
    for (let t, e = -1, n = this.numDictionaries; ++e < n; )
      (t = this.getDictionaryBatch(e)) && (yield t);
  }
  getRecordBatch(t) {
    return t >= 0 && t < this.numRecordBatches && this._recordBatches[t] || null;
  }
  getDictionaryBatch(t) {
    return t >= 0 && t < this.numDictionaries && this._dictionaryBatches[t] || null;
  }
}
class Ja extends Ve {
  get numRecordBatches() {
    return this._footer.recordBatchesLength();
  }
  get numDictionaries() {
    return this._footer.dictionariesLength();
  }
  constructor(t, e) {
    super(t, e.version()), this._footer = e;
  }
  getRecordBatch(t) {
    if (t >= 0 && t < this.numRecordBatches) {
      const e = this._footer.recordBatches(t);
      if (e)
        return Ht.decode(e);
    }
    return null;
  }
  getDictionaryBatch(t) {
    if (t >= 0 && t < this.numDictionaries) {
      const e = this._footer.dictionaries(t);
      if (e)
        return Ht.decode(e);
    }
    return null;
  }
}
class Ht {
  /** @nocollapse */
  static decode(t) {
    return new Ht(t.metaDataLength(), t.bodyLength(), t.offset());
  }
  /** @nocollapse */
  static encode(t, e) {
    const { metaDataLength: n } = e, s = BigInt(e.offset), r = BigInt(e.bodyLength);
    return cn.createBlock(t, s, n, r);
  }
  constructor(t, e, n) {
    this.metaDataLength = t, this.offset = k(n), this.bodyLength = k(e);
  }
}
const $ = Object.freeze({ done: !0, value: void 0 });
class ss {
  constructor(t) {
    this._json = t;
  }
  get schema() {
    return this._json.schema;
  }
  get batches() {
    return this._json.batches || [];
  }
  get dictionaries() {
    return this._json.dictionaries || [];
  }
}
class Tn {
  tee() {
    return this._getDOMStream().tee();
  }
  pipe(t, e) {
    return this._getNodeStream().pipe(t, e);
  }
  pipeTo(t, e) {
    return this._getDOMStream().pipeTo(t, e);
  }
  pipeThrough(t, e) {
    return this._getDOMStream().pipeThrough(t, e);
  }
  _getDOMStream() {
    return this._DOMStream || (this._DOMStream = this.toDOMStream());
  }
  _getNodeStream() {
    return this._nodeStream || (this._nodeStream = this.toNodeStream());
  }
}
class Za extends Tn {
  constructor() {
    super(), this._values = [], this.resolvers = [], this._closedPromise = new Promise((t) => this._closedPromiseResolve = t);
  }
  get closed() {
    return this._closedPromise;
  }
  cancel(t) {
    return B(this, void 0, void 0, function* () {
      yield this.return(t);
    });
  }
  write(t) {
    this._ensureOpen() && (this.resolvers.length <= 0 ? this._values.push(t) : this.resolvers.shift().resolve({ done: !1, value: t }));
  }
  abort(t) {
    this._closedPromiseResolve && (this.resolvers.length <= 0 ? this._error = { error: t } : this.resolvers.shift().reject({ done: !0, value: t }));
  }
  close() {
    if (this._closedPromiseResolve) {
      const { resolvers: t } = this;
      for (; t.length > 0; )
        t.shift().resolve($);
      this._closedPromiseResolve(), this._closedPromiseResolve = void 0;
    }
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  toDOMStream(t) {
    return dt.toDOMStream(this._closedPromiseResolve || this._error ? this : this._values, t);
  }
  toNodeStream(t) {
    return dt.toNodeStream(this._closedPromiseResolve || this._error ? this : this._values, t);
  }
  throw(t) {
    return B(this, void 0, void 0, function* () {
      return yield this.abort(t), $;
    });
  }
  return(t) {
    return B(this, void 0, void 0, function* () {
      return yield this.close(), $;
    });
  }
  read(t) {
    return B(this, void 0, void 0, function* () {
      return (yield this.next(t, "read")).value;
    });
  }
  peek(t) {
    return B(this, void 0, void 0, function* () {
      return (yield this.next(t, "peek")).value;
    });
  }
  next(...t) {
    return this._values.length > 0 ? Promise.resolve({ done: !1, value: this._values.shift() }) : this._error ? Promise.reject({ done: !0, value: this._error.error }) : this._closedPromiseResolve ? new Promise((e, n) => {
      this.resolvers.push({ resolve: e, reject: n });
    }) : Promise.resolve($);
  }
  _ensureOpen() {
    if (this._closedPromiseResolve)
      return !0;
    throw new Error("AsyncQueue is closed");
  }
}
class si extends Za {
  write(t) {
    if ((t = O(t)).byteLength > 0)
      return super.write(t);
  }
  toString(t = !1) {
    return t ? Xi(this.toUint8Array(!0)) : this.toUint8Array(!1).then(Xi);
  }
  toUint8Array(t = !1) {
    return t ? Ot(this._values)[0] : B(this, void 0, void 0, function* () {
      var e, n, s, r;
      const o = [];
      let a = 0;
      try {
        for (var c = !0, u = Xt(this), d; d = yield u.next(), e = d.done, !e; c = !0) {
          r = d.value, c = !1;
          const h = r;
          o.push(h), a += h.byteLength;
        }
      } catch (h) {
        n = { error: h };
      } finally {
        try {
          !c && !e && (s = u.return) && (yield s.call(u));
        } finally {
          if (n) throw n.error;
        }
      }
      return Ot(o, a)[0];
    });
  }
}
class Li {
  constructor(t) {
    t && (this.source = new Xa(dt.fromIterable(t)));
  }
  [Symbol.iterator]() {
    return this;
  }
  next(t) {
    return this.source.next(t);
  }
  throw(t) {
    return this.source.throw(t);
  }
  return(t) {
    return this.source.return(t);
  }
  peek(t) {
    return this.source.peek(t);
  }
  read(t) {
    return this.source.read(t);
  }
}
class Ie {
  constructor(t) {
    t instanceof Ie ? this.source = t.source : t instanceof si ? this.source = new Jt(dt.fromAsyncIterable(t)) : bs(t) ? this.source = new Jt(dt.fromNodeStream(t)) : pn(t) ? this.source = new Jt(dt.fromDOMStream(t)) : gs(t) ? this.source = new Jt(dt.fromDOMStream(t.body)) : $e(t) ? this.source = new Jt(dt.fromIterable(t)) : te(t) ? this.source = new Jt(dt.fromAsyncIterable(t)) : Be(t) && (this.source = new Jt(dt.fromAsyncIterable(t)));
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  next(t) {
    return this.source.next(t);
  }
  throw(t) {
    return this.source.throw(t);
  }
  return(t) {
    return this.source.return(t);
  }
  get closed() {
    return this.source.closed;
  }
  cancel(t) {
    return this.source.cancel(t);
  }
  peek(t) {
    return this.source.peek(t);
  }
  read(t) {
    return this.source.read(t);
  }
}
class Xa {
  constructor(t) {
    this.source = t;
  }
  cancel(t) {
    this.return(t);
  }
  peek(t) {
    return this.next(t, "peek").value;
  }
  read(t) {
    return this.next(t, "read").value;
  }
  next(t, e = "read") {
    return this.source.next({ cmd: e, size: t });
  }
  throw(t) {
    return Object.create(this.source.throw && this.source.throw(t) || $);
  }
  return(t) {
    return Object.create(this.source.return && this.source.return(t) || $);
  }
}
class Jt {
  constructor(t) {
    this.source = t, this._closedPromise = new Promise((e) => this._closedPromiseResolve = e);
  }
  cancel(t) {
    return B(this, void 0, void 0, function* () {
      yield this.return(t);
    });
  }
  get closed() {
    return this._closedPromise;
  }
  read(t) {
    return B(this, void 0, void 0, function* () {
      return (yield this.next(t, "read")).value;
    });
  }
  peek(t) {
    return B(this, void 0, void 0, function* () {
      return (yield this.next(t, "peek")).value;
    });
  }
  next(t) {
    return B(this, arguments, void 0, function* (e, n = "read") {
      return yield this.source.next({ cmd: n, size: e });
    });
  }
  throw(t) {
    return B(this, void 0, void 0, function* () {
      const e = this.source.throw && (yield this.source.throw(t)) || $;
      return this._closedPromiseResolve && this._closedPromiseResolve(), this._closedPromiseResolve = void 0, Object.create(e);
    });
  }
  return(t) {
    return B(this, void 0, void 0, function* () {
      const e = this.source.return && (yield this.source.return(t)) || $;
      return this._closedPromiseResolve && this._closedPromiseResolve(), this._closedPromiseResolve = void 0, Object.create(e);
    });
  }
}
class rs extends Li {
  constructor(t, e) {
    super(), this.position = 0, this.buffer = O(t), this.size = e === void 0 ? this.buffer.byteLength : e;
  }
  readInt32(t) {
    const { buffer: e, byteOffset: n } = this.readAt(t, 4);
    return new DataView(e, n).getInt32(0, !0);
  }
  seek(t) {
    return this.position = Math.min(t, this.size), t < this.size;
  }
  read(t) {
    const { buffer: e, size: n, position: s } = this;
    return e && s < n ? (typeof t != "number" && (t = Number.POSITIVE_INFINITY), this.position = Math.min(n, s + Math.min(n - s, t)), e.subarray(s, this.position)) : null;
  }
  readAt(t, e) {
    const n = this.buffer, s = Math.min(this.size, t + e);
    return n ? n.subarray(t, s) : new Uint8Array(e);
  }
  close() {
    this.buffer && (this.buffer = null);
  }
  throw(t) {
    return this.close(), { done: !0, value: t };
  }
  return(t) {
    return this.close(), { done: !0, value: t };
  }
}
class Ui extends Ie {
  constructor(t, e) {
    super(), this.position = 0, this._handle = t, typeof e == "number" ? this.size = e : this._pending = B(this, void 0, void 0, function* () {
      this.size = (yield t.stat()).size, delete this._pending;
    });
  }
  readInt32(t) {
    return B(this, void 0, void 0, function* () {
      const { buffer: e, byteOffset: n } = yield this.readAt(t, 4);
      return new DataView(e, n).getInt32(0, !0);
    });
  }
  seek(t) {
    return B(this, void 0, void 0, function* () {
      return this._pending && (yield this._pending), this.position = Math.min(t, this.size), t < this.size;
    });
  }
  read(t) {
    return B(this, void 0, void 0, function* () {
      this._pending && (yield this._pending);
      const { _handle: e, size: n, position: s } = this;
      if (e && s < n) {
        typeof t != "number" && (t = Number.POSITIVE_INFINITY);
        let r = s, o = 0, a = 0;
        const c = Math.min(n, r + Math.min(n - r, t)), u = new Uint8Array(Math.max(0, (this.position = c) - r));
        for (; (r += a) < c && (o += a) < u.byteLength; )
          ({ bytesRead: a } = yield e.read(u, o, u.byteLength - o, r));
        return u;
      }
      return null;
    });
  }
  readAt(t, e) {
    return B(this, void 0, void 0, function* () {
      this._pending && (yield this._pending);
      const { _handle: n, size: s } = this;
      if (n && t + e < s) {
        const r = Math.min(s, t + e), o = new Uint8Array(r - t);
        return (yield n.read(o, 0, e, t)).buffer;
      }
      return new Uint8Array(e);
    });
  }
  close() {
    return B(this, void 0, void 0, function* () {
      const t = this._handle;
      this._handle = null, t && (yield t.close());
    });
  }
  throw(t) {
    return B(this, void 0, void 0, function* () {
      return yield this.close(), { done: !0, value: t };
    });
  }
  return(t) {
    return B(this, void 0, void 0, function* () {
      return yield this.close(), { done: !0, value: t };
    });
  }
}
const tc = 65536;
function ye(i) {
  return i < 0 && (i = 4294967295 + i + 1), `0x${i.toString(16)}`;
}
const Se = 8, Dn = [
  1,
  10,
  100,
  1e3,
  1e4,
  1e5,
  1e6,
  1e7,
  1e8
];
class to {
  constructor(t) {
    this.buffer = t;
  }
  high() {
    return this.buffer[1];
  }
  low() {
    return this.buffer[0];
  }
  _times(t) {
    const e = new Uint32Array([
      this.buffer[1] >>> 16,
      this.buffer[1] & 65535,
      this.buffer[0] >>> 16,
      this.buffer[0] & 65535
    ]), n = new Uint32Array([
      t.buffer[1] >>> 16,
      t.buffer[1] & 65535,
      t.buffer[0] >>> 16,
      t.buffer[0] & 65535
    ]);
    let s = e[3] * n[3];
    this.buffer[0] = s & 65535;
    let r = s >>> 16;
    return s = e[2] * n[3], r += s, s = e[3] * n[2] >>> 0, r += s, this.buffer[0] += r << 16, this.buffer[1] = r >>> 0 < s ? tc : 0, this.buffer[1] += r >>> 16, this.buffer[1] += e[1] * n[3] + e[2] * n[2] + e[3] * n[1], this.buffer[1] += e[0] * n[3] + e[1] * n[2] + e[2] * n[1] + e[3] * n[0] << 16, this;
  }
  _plus(t) {
    const e = this.buffer[0] + t.buffer[0] >>> 0;
    this.buffer[1] += t.buffer[1], e < this.buffer[0] >>> 0 && ++this.buffer[1], this.buffer[0] = e;
  }
  lessThan(t) {
    return this.buffer[1] < t.buffer[1] || this.buffer[1] === t.buffer[1] && this.buffer[0] < t.buffer[0];
  }
  equals(t) {
    return this.buffer[1] === t.buffer[1] && this.buffer[0] == t.buffer[0];
  }
  greaterThan(t) {
    return t.lessThan(this);
  }
  hex() {
    return `${ye(this.buffer[1])} ${ye(this.buffer[0])}`;
  }
}
class C extends to {
  times(t) {
    return this._times(t), this;
  }
  plus(t) {
    return this._plus(t), this;
  }
  /** @nocollapse */
  static from(t, e = new Uint32Array(2)) {
    return C.fromString(typeof t == "string" ? t : t.toString(), e);
  }
  /** @nocollapse */
  static fromNumber(t, e = new Uint32Array(2)) {
    return C.fromString(t.toString(), e);
  }
  /** @nocollapse */
  static fromString(t, e = new Uint32Array(2)) {
    const n = t.length, s = new C(e);
    for (let r = 0; r < n; ) {
      const o = Se < n - r ? Se : n - r, a = new C(new Uint32Array([Number.parseInt(t.slice(r, r + o), 10), 0])), c = new C(new Uint32Array([Dn[o], 0]));
      s.times(c), s.plus(a), r += o;
    }
    return s;
  }
  /** @nocollapse */
  static convertArray(t) {
    const e = new Uint32Array(t.length * 2);
    for (let n = -1, s = t.length; ++n < s; )
      C.from(t[n], new Uint32Array(e.buffer, e.byteOffset + 2 * n * 4, 2));
    return e;
  }
  /** @nocollapse */
  static multiply(t, e) {
    return new C(new Uint32Array(t.buffer)).times(e);
  }
  /** @nocollapse */
  static add(t, e) {
    return new C(new Uint32Array(t.buffer)).plus(e);
  }
}
class it extends to {
  negate() {
    return this.buffer[0] = ~this.buffer[0] + 1, this.buffer[1] = ~this.buffer[1], this.buffer[0] == 0 && ++this.buffer[1], this;
  }
  times(t) {
    return this._times(t), this;
  }
  plus(t) {
    return this._plus(t), this;
  }
  lessThan(t) {
    const e = this.buffer[1] << 0, n = t.buffer[1] << 0;
    return e < n || e === n && this.buffer[0] < t.buffer[0];
  }
  /** @nocollapse */
  static from(t, e = new Uint32Array(2)) {
    return it.fromString(typeof t == "string" ? t : t.toString(), e);
  }
  /** @nocollapse */
  static fromNumber(t, e = new Uint32Array(2)) {
    return it.fromString(t.toString(), e);
  }
  /** @nocollapse */
  static fromString(t, e = new Uint32Array(2)) {
    const n = t.startsWith("-"), s = t.length, r = new it(e);
    for (let o = n ? 1 : 0; o < s; ) {
      const a = Se < s - o ? Se : s - o, c = new it(new Uint32Array([Number.parseInt(t.slice(o, o + a), 10), 0])), u = new it(new Uint32Array([Dn[a], 0]));
      r.times(u), r.plus(c), o += a;
    }
    return n ? r.negate() : r;
  }
  /** @nocollapse */
  static convertArray(t) {
    const e = new Uint32Array(t.length * 2);
    for (let n = -1, s = t.length; ++n < s; )
      it.from(t[n], new Uint32Array(e.buffer, e.byteOffset + 2 * n * 4, 2));
    return e;
  }
  /** @nocollapse */
  static multiply(t, e) {
    return new it(new Uint32Array(t.buffer)).times(e);
  }
  /** @nocollapse */
  static add(t, e) {
    return new it(new Uint32Array(t.buffer)).plus(e);
  }
}
class St {
  constructor(t) {
    this.buffer = t;
  }
  high() {
    return new it(new Uint32Array(this.buffer.buffer, this.buffer.byteOffset + 8, 2));
  }
  low() {
    return new it(new Uint32Array(this.buffer.buffer, this.buffer.byteOffset, 2));
  }
  negate() {
    return this.buffer[0] = ~this.buffer[0] + 1, this.buffer[1] = ~this.buffer[1], this.buffer[2] = ~this.buffer[2], this.buffer[3] = ~this.buffer[3], this.buffer[0] == 0 && ++this.buffer[1], this.buffer[1] == 0 && ++this.buffer[2], this.buffer[2] == 0 && ++this.buffer[3], this;
  }
  times(t) {
    const e = new C(new Uint32Array([this.buffer[3], 0])), n = new C(new Uint32Array([this.buffer[2], 0])), s = new C(new Uint32Array([this.buffer[1], 0])), r = new C(new Uint32Array([this.buffer[0], 0])), o = new C(new Uint32Array([t.buffer[3], 0])), a = new C(new Uint32Array([t.buffer[2], 0])), c = new C(new Uint32Array([t.buffer[1], 0])), u = new C(new Uint32Array([t.buffer[0], 0]));
    let d = C.multiply(r, u);
    this.buffer[0] = d.low();
    const h = new C(new Uint32Array([d.high(), 0]));
    return d = C.multiply(s, u), h.plus(d), d = C.multiply(r, c), h.plus(d), this.buffer[1] = h.low(), this.buffer[3] = h.lessThan(d) ? 1 : 0, this.buffer[2] = h.high(), new C(new Uint32Array(this.buffer.buffer, this.buffer.byteOffset + 8, 2)).plus(C.multiply(n, u)).plus(C.multiply(s, c)).plus(C.multiply(r, a)), this.buffer[3] += C.multiply(e, u).plus(C.multiply(n, c)).plus(C.multiply(s, a)).plus(C.multiply(r, o)).low(), this;
  }
  plus(t) {
    const e = new Uint32Array(4);
    return e[3] = this.buffer[3] + t.buffer[3] >>> 0, e[2] = this.buffer[2] + t.buffer[2] >>> 0, e[1] = this.buffer[1] + t.buffer[1] >>> 0, e[0] = this.buffer[0] + t.buffer[0] >>> 0, e[0] < this.buffer[0] >>> 0 && ++e[1], e[1] < this.buffer[1] >>> 0 && ++e[2], e[2] < this.buffer[2] >>> 0 && ++e[3], this.buffer[3] = e[3], this.buffer[2] = e[2], this.buffer[1] = e[1], this.buffer[0] = e[0], this;
  }
  hex() {
    return `${ye(this.buffer[3])} ${ye(this.buffer[2])} ${ye(this.buffer[1])} ${ye(this.buffer[0])}`;
  }
  /** @nocollapse */
  static multiply(t, e) {
    return new St(new Uint32Array(t.buffer)).times(e);
  }
  /** @nocollapse */
  static add(t, e) {
    return new St(new Uint32Array(t.buffer)).plus(e);
  }
  /** @nocollapse */
  static from(t, e = new Uint32Array(4)) {
    return St.fromString(typeof t == "string" ? t : t.toString(), e);
  }
  /** @nocollapse */
  static fromNumber(t, e = new Uint32Array(4)) {
    return St.fromString(t.toString(), e);
  }
  /** @nocollapse */
  static fromString(t, e = new Uint32Array(4)) {
    const n = t.startsWith("-"), s = t.length, r = new St(e);
    for (let o = n ? 1 : 0; o < s; ) {
      const a = Se < s - o ? Se : s - o, c = new St(new Uint32Array([Number.parseInt(t.slice(o, o + a), 10), 0, 0, 0])), u = new St(new Uint32Array([Dn[a], 0, 0, 0]));
      r.times(u), r.plus(c), o += a;
    }
    return n ? r.negate() : r;
  }
  /** @nocollapse */
  static convertArray(t) {
    const e = new Uint32Array(t.length * 4);
    for (let n = -1, s = t.length; ++n < s; )
      St.from(t[n], new Uint32Array(e.buffer, e.byteOffset + 16 * n, 4));
    return e;
  }
}
class eo extends T {
  constructor(t, e, n, s, r = G.V5) {
    super(), this.nodesIndex = -1, this.buffersIndex = -1, this.bytes = t, this.nodes = e, this.buffers = n, this.dictionaries = s, this.metadataVersion = r;
  }
  visit(t) {
    return super.visit(t instanceof z ? t.type : t);
  }
  visitNull(t, { length: e } = this.nextFieldNode()) {
    return D({ type: t, length: e });
  }
  visitBool(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitInt(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitFloat(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitUtf8(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), valueOffsets: this.readOffsets(t), data: this.readData(t) });
  }
  visitLargeUtf8(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), valueOffsets: this.readOffsets(t), data: this.readData(t) });
  }
  visitBinary(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), valueOffsets: this.readOffsets(t), data: this.readData(t) });
  }
  visitLargeBinary(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), valueOffsets: this.readOffsets(t), data: this.readData(t) });
  }
  visitFixedSizeBinary(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitDate(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitTimestamp(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitTime(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitDecimal(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitList(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), valueOffsets: this.readOffsets(t), child: this.visit(t.children[0]) });
  }
  visitStruct(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), children: this.visitMany(t.children) });
  }
  visitUnion(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return this.metadataVersion < G.V5 && this.readNullBitmap(t, n), t.mode === J.Sparse ? this.visitSparseUnion(t, { length: e, nullCount: n }) : this.visitDenseUnion(t, { length: e, nullCount: n });
  }
  visitDenseUnion(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, typeIds: this.readTypeIds(t), valueOffsets: this.readOffsets(t), children: this.visitMany(t.children) });
  }
  visitSparseUnion(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, typeIds: this.readTypeIds(t), children: this.visitMany(t.children) });
  }
  visitDictionary(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t.indices), dictionary: this.readDictionary(t) });
  }
  visitInterval(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitDuration(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitFixedSizeList(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), child: this.visit(t.children[0]) });
  }
  visitMap(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return D({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), valueOffsets: this.readOffsets(t), child: this.visit(t.children[0]) });
  }
  nextFieldNode() {
    return this.nodes[++this.nodesIndex];
  }
  nextBufferRange() {
    return this.buffers[++this.buffersIndex];
  }
  readNullBitmap(t, e, n = this.nextBufferRange()) {
    return e > 0 && this.readData(t, n) || new Uint8Array(0);
  }
  readOffsets(t, e) {
    return this.readData(t, e);
  }
  readTypeIds(t, e) {
    return this.readData(t, e);
  }
  readData(t, { length: e, offset: n } = this.nextBufferRange()) {
    return this.bytes.subarray(n, n + e);
  }
  readDictionary(t) {
    return this.dictionaries.get(t.id);
  }
}
class ec extends eo {
  constructor(t, e, n, s, r) {
    super(new Uint8Array(0), e, n, s, r), this.sources = t;
  }
  readNullBitmap(t, e, { offset: n } = this.nextBufferRange()) {
    return e <= 0 ? new Uint8Array(0) : Oi(this.sources[n]);
  }
  readOffsets(t, { offset: e } = this.nextBufferRange()) {
    return P(Uint8Array, P(t.OffsetArrayType, this.sources[e]));
  }
  readTypeIds(t, { offset: e } = this.nextBufferRange()) {
    return P(Uint8Array, P(t.ArrayType, this.sources[e]));
  }
  readData(t, { offset: e } = this.nextBufferRange()) {
    const { sources: n } = this;
    return f.isTimestamp(t) || (f.isInt(t) || f.isTime(t)) && t.bitWidth === 64 || f.isDuration(t) || f.isDate(t) && t.unit === pt.MILLISECOND ? P(Uint8Array, it.convertArray(n[e])) : f.isDecimal(t) ? P(Uint8Array, St.convertArray(n[e])) : f.isBinary(t) || f.isLargeBinary(t) || f.isFixedSizeBinary(t) ? ic(n[e]) : f.isBool(t) ? Oi(n[e]) : f.isUtf8(t) || f.isLargeUtf8(t) ? yn(n[e].join("")) : P(Uint8Array, P(t.ArrayType, n[e].map((s) => +s)));
  }
}
function ic(i) {
  const t = i.join(""), e = new Uint8Array(t.length / 2);
  for (let n = 0; n < t.length; n += 2)
    e[n >> 1] = Number.parseInt(t.slice(n, n + 2), 16);
  return e;
}
class _ extends T {
  compareSchemas(t, e) {
    return t === e || e instanceof t.constructor && this.compareManyFields(t.fields, e.fields);
  }
  compareManyFields(t, e) {
    return t === e || Array.isArray(t) && Array.isArray(e) && t.length === e.length && t.every((n, s) => this.compareFields(n, e[s]));
  }
  compareFields(t, e) {
    return t === e || e instanceof t.constructor && t.name === e.name && t.nullable === e.nullable && this.visit(t.type, e.type);
  }
}
function et(i, t) {
  return t instanceof i.constructor;
}
function ie(i, t) {
  return i === t || et(i, t);
}
function xt(i, t) {
  return i === t || et(i, t) && i.bitWidth === t.bitWidth && i.isSigned === t.isSigned;
}
function Vi(i, t) {
  return i === t || et(i, t) && i.precision === t.precision;
}
function nc(i, t) {
  return i === t || et(i, t) && i.byteWidth === t.byteWidth;
}
function Fn(i, t) {
  return i === t || et(i, t) && i.unit === t.unit;
}
function Ye(i, t) {
  return i === t || et(i, t) && i.unit === t.unit && i.timezone === t.timezone;
}
function We(i, t) {
  return i === t || et(i, t) && i.unit === t.unit && i.bitWidth === t.bitWidth;
}
function sc(i, t) {
  return i === t || et(i, t) && i.children.length === t.children.length && qt.compareManyFields(i.children, t.children);
}
function rc(i, t) {
  return i === t || et(i, t) && i.children.length === t.children.length && qt.compareManyFields(i.children, t.children);
}
function On(i, t) {
  return i === t || et(i, t) && i.mode === t.mode && i.typeIds.every((e, n) => e === t.typeIds[n]) && qt.compareManyFields(i.children, t.children);
}
function oc(i, t) {
  return i === t || et(i, t) && i.id === t.id && i.isOrdered === t.isOrdered && qt.visit(i.indices, t.indices) && qt.visit(i.dictionary, t.dictionary);
}
function En(i, t) {
  return i === t || et(i, t) && i.unit === t.unit;
}
function Ge(i, t) {
  return i === t || et(i, t) && i.unit === t.unit;
}
function ac(i, t) {
  return i === t || et(i, t) && i.listSize === t.listSize && i.children.length === t.children.length && qt.compareManyFields(i.children, t.children);
}
function cc(i, t) {
  return i === t || et(i, t) && i.keysSorted === t.keysSorted && i.children.length === t.children.length && qt.compareManyFields(i.children, t.children);
}
_.prototype.visitNull = ie;
_.prototype.visitBool = ie;
_.prototype.visitInt = xt;
_.prototype.visitInt8 = xt;
_.prototype.visitInt16 = xt;
_.prototype.visitInt32 = xt;
_.prototype.visitInt64 = xt;
_.prototype.visitUint8 = xt;
_.prototype.visitUint16 = xt;
_.prototype.visitUint32 = xt;
_.prototype.visitUint64 = xt;
_.prototype.visitFloat = Vi;
_.prototype.visitFloat16 = Vi;
_.prototype.visitFloat32 = Vi;
_.prototype.visitFloat64 = Vi;
_.prototype.visitUtf8 = ie;
_.prototype.visitLargeUtf8 = ie;
_.prototype.visitBinary = ie;
_.prototype.visitLargeBinary = ie;
_.prototype.visitFixedSizeBinary = nc;
_.prototype.visitDate = Fn;
_.prototype.visitDateDay = Fn;
_.prototype.visitDateMillisecond = Fn;
_.prototype.visitTimestamp = Ye;
_.prototype.visitTimestampSecond = Ye;
_.prototype.visitTimestampMillisecond = Ye;
_.prototype.visitTimestampMicrosecond = Ye;
_.prototype.visitTimestampNanosecond = Ye;
_.prototype.visitTime = We;
_.prototype.visitTimeSecond = We;
_.prototype.visitTimeMillisecond = We;
_.prototype.visitTimeMicrosecond = We;
_.prototype.visitTimeNanosecond = We;
_.prototype.visitDecimal = ie;
_.prototype.visitList = sc;
_.prototype.visitStruct = rc;
_.prototype.visitUnion = On;
_.prototype.visitDenseUnion = On;
_.prototype.visitSparseUnion = On;
_.prototype.visitDictionary = oc;
_.prototype.visitInterval = En;
_.prototype.visitIntervalDayTime = En;
_.prototype.visitIntervalYearMonth = En;
_.prototype.visitDuration = Ge;
_.prototype.visitDurationSecond = Ge;
_.prototype.visitDurationMillisecond = Ge;
_.prototype.visitDurationMicrosecond = Ge;
_.prototype.visitDurationNanosecond = Ge;
_.prototype.visitFixedSizeList = ac;
_.prototype.visitMap = cc;
const qt = new _();
function un(i, t) {
  return qt.compareSchemas(i, t);
}
function qi(i, t) {
  return lc(i, t.map((e) => e.data.concat()));
}
function lc(i, t) {
  const e = [...i.fields], n = [], s = { numBatches: t.reduce((h, V) => Math.max(h, V.length), 0) };
  let r = 0, o = 0, a = -1;
  const c = t.length;
  let u, d = [];
  for (; s.numBatches-- > 0; ) {
    for (o = Number.POSITIVE_INFINITY, a = -1; ++a < c; )
      d[a] = u = t[a].shift(), o = Math.min(o, u ? u.length : o);
    Number.isFinite(o) && (d = uc(e, o, d, t, s), o > 0 && (n[r++] = D({
      type: new X(e),
      length: o,
      nullCount: 0,
      children: d.slice()
    })));
  }
  return [
    i = i.assign(e),
    n.map((h) => new st(i, h))
  ];
}
function uc(i, t, e, n, s) {
  var r;
  const o = (t + 63 & -64) >> 3;
  for (let a = -1, c = n.length; ++a < c; ) {
    const u = e[a], d = u?.length;
    if (d >= t)
      d === t ? e[a] = u : (e[a] = u.slice(0, t), s.numBatches = Math.max(s.numBatches, n[a].unshift(u.slice(t, d - t))));
    else {
      const h = i[a];
      i[a] = h.clone({ nullable: !0 }), e[a] = (r = u?._changeLengthAndBackfillNullBitmap(t)) !== null && r !== void 0 ? r : D({
        type: h.type,
        length: t,
        nullCount: t,
        nullBitmap: new Uint8Array(o)
      });
    }
  }
  return e;
}
var io;
class Z {
  constructor(...t) {
    var e, n;
    if (t.length === 0)
      return this.batches = [], this.schema = new L([]), this._offsets = [0], this;
    let s, r;
    t[0] instanceof L && (s = t.shift()), t.at(-1) instanceof Uint32Array && (r = t.pop());
    const o = (c) => {
      if (c) {
        if (c instanceof st)
          return [c];
        if (c instanceof Z)
          return c.batches;
        if (c instanceof M) {
          if (c.type instanceof X)
            return [new st(new L(c.type.children), c)];
        } else {
          if (Array.isArray(c))
            return c.flatMap((u) => o(u));
          if (typeof c[Symbol.iterator] == "function")
            return [...c].flatMap((u) => o(u));
          if (typeof c == "object") {
            const u = Object.keys(c), d = u.map((F) => new R([c[F]])), h = s ?? new L(u.map((F, W) => new z(String(F), d[W].type, d[W].nullable))), [, V] = qi(h, d);
            return V.length === 0 ? [new st(c)] : V;
          }
        }
      }
      return [];
    }, a = t.flatMap((c) => o(c));
    if (s = (n = s ?? ((e = a[0]) === null || e === void 0 ? void 0 : e.schema)) !== null && n !== void 0 ? n : new L([]), !(s instanceof L))
      throw new TypeError("Table constructor expects a [Schema, RecordBatch[]] pair.");
    for (const c of a) {
      if (!(c instanceof st))
        throw new TypeError("Table constructor expects a [Schema, RecordBatch[]] pair.");
      if (!un(s, c.schema))
        throw new TypeError("Table and inner RecordBatch schemas must be equivalent.");
    }
    this.schema = s, this.batches = a, this._offsets = r ?? Gr(this.data);
  }
  /**
   * The contiguous {@link RecordBatch `RecordBatch`} chunks of the Table rows.
   */
  get data() {
    return this.batches.map(({ data: t }) => t);
  }
  /**
   * The number of columns in this Table.
   */
  get numCols() {
    return this.schema.fields.length;
  }
  /**
   * The number of rows in this Table.
   */
  get numRows() {
    return this.data.reduce((t, e) => t + e.length, 0);
  }
  /**
   * The number of null rows in this Table.
   */
  get nullCount() {
    return this._nullCount === -1 && (this._nullCount = Wr(this.data)), this._nullCount;
  }
  /**
   * Check whether an element is null.
   *
   * @param index The index at which to read the validity bitmap.
   */
  // @ts-ignore
  isValid(t) {
    return !1;
  }
  /**
   * Get an element value by position.
   *
   * @param index The index of the element to read.
   */
  // @ts-ignore
  get(t) {
    return null;
  }
  /**
    * Get an element value by position.
    * @param index The index of the element to read. A negative index will count back from the last element.
    */
  // @ts-ignore
  at(t) {
    return this.get(vn(t, this.numRows));
  }
  /**
   * Set an element value by position.
   *
   * @param index The index of the element to write.
   * @param value The value to set.
   */
  // @ts-ignore
  set(t, e) {
  }
  /**
   * Retrieve the index of the first occurrence of a value in an Vector.
   *
   * @param element The value to locate in the Vector.
   * @param offset The index at which to begin the search. If offset is omitted, the search starts at index 0.
   */
  // @ts-ignore
  indexOf(t, e) {
    return -1;
  }
  /**
   * Iterator for rows in this Table.
   */
  [Symbol.iterator]() {
    return this.batches.length > 0 ? An.visit(new R(this.data)) : new Array(0)[Symbol.iterator]();
  }
  /**
   * Return a JavaScript Array of the Table rows.
   *
   * @returns An Array of Table rows.
   */
  toArray() {
    return [...this];
  }
  /**
   * Returns a string representation of the Table rows.
   *
   * @returns A string representation of the Table rows.
   */
  toString() {
    return `[
  ${this.toArray().join(`,
  `)}
]`;
  }
  /**
   * Combines two or more Tables of the same schema.
   *
   * @param others Additional Tables to add to the end of this Tables.
   */
  concat(...t) {
    const e = this.schema, n = this.data.concat(t.flatMap(({ data: s }) => s));
    return new Z(e, n.map((s) => new st(e, s)));
  }
  /**
   * Return a zero-copy sub-section of this Table.
   *
   * @param begin The beginning of the specified portion of the Table.
   * @param end The end of the specified portion of the Table. This is exclusive of the element at the index 'end'.
   */
  slice(t, e) {
    const n = this.schema;
    [t, e] = $r({ length: this.numRows }, t, e);
    const s = Hr(this.data, this._offsets, t, e);
    return new Z(n, s.map((r) => new st(n, r)));
  }
  /**
   * Returns a child Vector by name, or null if this Vector has no child with the given name.
   *
   * @param name The name of the child to retrieve.
   */
  getChild(t) {
    return this.getChildAt(this.schema.fields.findIndex((e) => e.name === t));
  }
  /**
   * Returns a child Vector by index, or null if this Vector has no child at the supplied index.
   *
   * @param index The index of the child to retrieve.
   */
  getChildAt(t) {
    if (t > -1 && t < this.schema.fields.length) {
      const e = this.data.map((n) => n.children[t]);
      if (e.length === 0) {
        const { type: n } = this.schema.fields[t], s = D({ type: n, length: 0, nullCount: 0 });
        e.push(s._changeLengthAndBackfillNullBitmap(this.numRows));
      }
      return new R(e);
    }
    return null;
  }
  /**
   * Sets a child Vector by name.
   *
   * @param name The name of the child to overwrite.
   * @returns A new Table with the supplied child for the specified name.
   */
  setChild(t, e) {
    var n;
    return this.setChildAt((n = this.schema.fields) === null || n === void 0 ? void 0 : n.findIndex((s) => s.name === t), e);
  }
  setChildAt(t, e) {
    let n = this.schema, s = [...this.batches];
    if (t > -1 && t < this.numCols) {
      e || (e = new R([D({ type: new Gt(), length: this.numRows })]));
      const r = n.fields.slice(), o = r[t].clone({ type: e.type }), a = this.schema.fields.map((c, u) => this.getChildAt(u));
      [r[t], a[t]] = [o, e], [n, s] = qi(n, a);
    }
    return new Z(n, s);
  }
  /**
   * Construct a new Table containing only specified columns.
   *
   * @param columnNames Names of columns to keep.
   * @returns A new Table of columns matching the specified names.
   */
  select(t) {
    const e = this.schema.fields.reduce((n, s, r) => n.set(s.name, r), /* @__PURE__ */ new Map());
    return this.selectAt(t.map((n) => e.get(n)).filter((n) => n > -1));
  }
  /**
   * Construct a new Table containing only columns at the specified indices.
   *
   * @param columnIndices Indices of columns to keep.
   * @returns A new Table of columns at the specified indices.
   */
  selectAt(t) {
    const e = this.schema.selectAt(t), n = this.batches.map((s) => s.selectAt(t));
    return new Z(e, n);
  }
  assign(t) {
    const e = this.schema.fields, [n, s] = t.schema.fields.reduce((a, c, u) => {
      const [d, h] = a, V = e.findIndex((F) => F.name === c.name);
      return ~V ? h[V] = u : d.push(u), a;
    }, [[], []]), r = this.schema.assign(t.schema), o = [
      ...e.map((a, c) => [c, s[c]]).map(([a, c]) => c === void 0 ? this.getChildAt(a) : t.getChildAt(c)),
      ...n.map((a) => t.getChildAt(a))
    ].filter(Boolean);
    return new Z(...qi(r, o));
  }
}
io = Symbol.toStringTag;
Z[io] = ((i) => (i.schema = null, i.batches = [], i._offsets = new Uint32Array([0]), i._nullCount = -1, i[Symbol.isConcatSpreadable] = !0, i.isValid = Ei(Bn), i.get = Ei(ot.getVisitFn(l.Struct)), i.set = qr(mt.getVisitFn(l.Struct)), i.indexOf = Kr(Ni.getVisitFn(l.Struct)), "Table"))(Z.prototype);
var no;
let st = class Me {
  constructor(...t) {
    switch (t.length) {
      case 2: {
        if ([this.schema] = t, !(this.schema instanceof L))
          throw new TypeError("RecordBatch constructor expects a [Schema, Data] pair.");
        if ([
          ,
          this.data = D({
            nullCount: 0,
            type: new X(this.schema.fields),
            children: this.schema.fields.map((e) => D({ type: e.type, nullCount: 0 }))
          })
        ] = t, !(this.data instanceof M))
          throw new TypeError("RecordBatch constructor expects a [Schema, Data] pair.");
        [this.schema, this.data] = os(this.schema, this.data.children);
        break;
      }
      case 1: {
        const [e] = t, { fields: n, children: s, length: r } = Object.keys(e).reduce((c, u, d) => (c.children[d] = e[u], c.length = Math.max(c.length, e[u].length), c.fields[d] = z.new({ name: u, type: e[u].type, nullable: !0 }), c), {
          length: 0,
          fields: new Array(),
          children: new Array()
        }), o = new L(n), a = D({ type: new X(n), length: r, children: s, nullCount: 0 });
        [this.schema, this.data] = os(o, a.children, r);
        break;
      }
      default:
        throw new TypeError("RecordBatch constructor expects an Object mapping names to child Data, or a [Schema, Data] pair.");
    }
  }
  get dictionaries() {
    return this._dictionaries || (this._dictionaries = so(this.schema.fields, this.data.children));
  }
  /**
   * The number of columns in this RecordBatch.
   */
  get numCols() {
    return this.schema.fields.length;
  }
  /**
   * The number of rows in this RecordBatch.
   */
  get numRows() {
    return this.data.length;
  }
  /**
   * The number of null rows in this RecordBatch.
   */
  get nullCount() {
    return this.data.nullCount;
  }
  /**
   * Check whether an row is null.
   * @param index The index at which to read the validity bitmap.
   */
  isValid(t) {
    return this.data.getValid(t);
  }
  /**
   * Get a row by position.
   * @param index The index of the row to read.
   */
  get(t) {
    return ot.visit(this.data, t);
  }
  /**
    * Get a row value by position.
    * @param index The index of the row to read. A negative index will count back from the last row.
    */
  at(t) {
    return this.get(vn(t, this.numRows));
  }
  /**
   * Set a row by position.
   * @param index The index of the row to write.
   * @param value The value to set.
   */
  set(t, e) {
    return mt.visit(this.data, t, e);
  }
  /**
   * Retrieve the index of the first occurrence of a row in an RecordBatch.
   * @param element The row to locate in the RecordBatch.
   * @param offset The index at which to begin the search. If offset is omitted, the search starts at index 0.
   */
  indexOf(t, e) {
    return Ni.visit(this.data, t, e);
  }
  /**
   * Iterator for rows in this RecordBatch.
   */
  [Symbol.iterator]() {
    return An.visit(new R([this.data]));
  }
  /**
   * Return a JavaScript Array of the RecordBatch rows.
   * @returns An Array of RecordBatch rows.
   */
  toArray() {
    return [...this];
  }
  /**
   * Combines two or more RecordBatch of the same schema.
   * @param others Additional RecordBatch to add to the end of this RecordBatch.
   */
  concat(...t) {
    return new Z(this.schema, [this, ...t]);
  }
  /**
   * Return a zero-copy sub-section of this RecordBatch.
   * @param start The beginning of the specified portion of the RecordBatch.
   * @param end The end of the specified portion of the RecordBatch. This is exclusive of the row at the index 'end'.
   */
  slice(t, e) {
    const [n] = new R([this.data]).slice(t, e).data;
    return new Me(this.schema, n);
  }
  /**
   * Returns a child Vector by name, or null if this Vector has no child with the given name.
   * @param name The name of the child to retrieve.
   */
  getChild(t) {
    var e;
    return this.getChildAt((e = this.schema.fields) === null || e === void 0 ? void 0 : e.findIndex((n) => n.name === t));
  }
  /**
   * Returns a child Vector by index, or null if this Vector has no child at the supplied index.
   * @param index The index of the child to retrieve.
   */
  getChildAt(t) {
    return t > -1 && t < this.schema.fields.length ? new R([this.data.children[t]]) : null;
  }
  /**
   * Sets a child Vector by name.
   * @param name The name of the child to overwrite.
   * @returns A new RecordBatch with the new child for the specified name.
   */
  setChild(t, e) {
    var n;
    return this.setChildAt((n = this.schema.fields) === null || n === void 0 ? void 0 : n.findIndex((s) => s.name === t), e);
  }
  setChildAt(t, e) {
    let n = this.schema, s = this.data;
    if (t > -1 && t < this.numCols) {
      e || (e = new R([D({ type: new Gt(), length: this.numRows })]));
      const r = n.fields.slice(), o = s.children.slice(), a = r[t].clone({ type: e.type });
      [r[t], o[t]] = [a, e.data[0]], n = new L(r, new Map(this.schema.metadata)), s = D({ type: new X(r), children: o });
    }
    return new Me(n, s);
  }
  /**
   * Construct a new RecordBatch containing only specified columns.
   *
   * @param columnNames Names of columns to keep.
   * @returns A new RecordBatch of columns matching the specified names.
   */
  select(t) {
    const e = this.schema.select(t), n = new X(e.fields), s = [];
    for (const r of t) {
      const o = this.schema.fields.findIndex((a) => a.name === r);
      ~o && (s[o] = this.data.children[o]);
    }
    return new Me(e, D({ type: n, length: this.numRows, children: s }));
  }
  /**
   * Construct a new RecordBatch containing only columns at the specified indices.
   *
   * @param columnIndices Indices of columns to keep.
   * @returns A new RecordBatch of columns matching at the specified indices.
   */
  selectAt(t) {
    const e = this.schema.selectAt(t), n = t.map((r) => this.data.children[r]).filter(Boolean), s = D({ type: new X(e.fields), length: this.numRows, children: n });
    return new Me(e, s);
  }
};
no = Symbol.toStringTag;
st[no] = ((i) => (i._nullCount = -1, i[Symbol.isConcatSpreadable] = !0, "RecordBatch"))(st.prototype);
function os(i, t, e = t.reduce((n, s) => Math.max(n, s.length), 0)) {
  var n;
  const s = [...i.fields], r = [...t], o = (e + 63 & -64) >> 3;
  for (const [a, c] of i.fields.entries()) {
    const u = t[a];
    (!u || u.length !== e) && (s[a] = c.clone({ nullable: !0 }), r[a] = (n = u?._changeLengthAndBackfillNullBitmap(e)) !== null && n !== void 0 ? n : D({
      type: c.type,
      length: e,
      nullCount: e,
      nullBitmap: new Uint8Array(o)
    }));
  }
  return [
    i.assign(s),
    D({ type: new X(s), length: e, children: r })
  ];
}
function so(i, t, e = /* @__PURE__ */ new Map()) {
  var n, s;
  if (((n = i?.length) !== null && n !== void 0 ? n : 0) > 0 && i?.length === t?.length)
    for (let r = -1, o = i.length; ++r < o; ) {
      const { type: a } = i[r], c = t[r];
      for (const u of [c, ...((s = c?.dictionary) === null || s === void 0 ? void 0 : s.data) || []])
        so(a.children, u?.children, e);
      if (f.isDictionary(a)) {
        const { id: u } = a;
        if (!e.has(u))
          c?.dictionary && e.set(u, c.dictionary);
        else if (e.get(u) !== c.dictionary)
          throw new Error("Cannot create Schema containing two different dictionaries with the same Id");
      }
    }
  return e;
}
class Nn extends st {
  constructor(t) {
    const e = t.fields.map((s) => D({ type: s.type })), n = D({ type: new X(t.fields), nullCount: 0, children: e });
    super(t, n);
  }
}
let jt = class vt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsMessage(t, e) {
    return (e || new vt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsMessage(t, e) {
    return t.setPosition(t.position() + U), (e || new vt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  version() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : G.V1;
  }
  headerType() {
    const t = this.bb.__offset(this.bb_pos, 6);
    return t ? this.bb.readUint8(this.bb_pos + t) : N.NONE;
  }
  header(t) {
    const e = this.bb.__offset(this.bb_pos, 8);
    return e ? this.bb.__union(t, this.bb_pos + e) : null;
  }
  bodyLength() {
    const t = this.bb.__offset(this.bb_pos, 10);
    return t ? this.bb.readInt64(this.bb_pos + t) : BigInt("0");
  }
  customMetadata(t, e) {
    const n = this.bb.__offset(this.bb_pos, 12);
    return n ? (e || new q()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + n) + t * 4), this.bb) : null;
  }
  customMetadataLength() {
    const t = this.bb.__offset(this.bb_pos, 12);
    return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
  }
  static startMessage(t) {
    t.startObject(5);
  }
  static addVersion(t, e) {
    t.addFieldInt16(0, e, G.V1);
  }
  static addHeaderType(t, e) {
    t.addFieldInt8(1, e, N.NONE);
  }
  static addHeader(t, e) {
    t.addFieldOffset(2, e, 0);
  }
  static addBodyLength(t, e) {
    t.addFieldInt64(3, e, BigInt("0"));
  }
  static addCustomMetadata(t, e) {
    t.addFieldOffset(4, e, 0);
  }
  static createCustomMetadataVector(t, e) {
    t.startVector(4, e.length, 4);
    for (let n = e.length - 1; n >= 0; n--)
      t.addOffset(e[n]);
    return t.endVector();
  }
  static startCustomMetadataVector(t, e) {
    t.startVector(4, e, 4);
  }
  static endMessage(t) {
    return t.endObject();
  }
  static finishMessageBuffer(t, e) {
    t.finish(e);
  }
  static finishSizePrefixedMessageBuffer(t, e) {
    t.finish(e, void 0, !0);
  }
  static createMessage(t, e, n, s, r, o) {
    return vt.startMessage(t), vt.addVersion(t, e), vt.addHeaderType(t, n), vt.addHeader(t, s), vt.addBodyLength(t, r), vt.addCustomMetadata(t, o), vt.endMessage(t);
  }
};
class dc extends T {
  visit(t, e) {
    return t == null || e == null ? void 0 : super.visit(t, e);
  }
  visitNull(t, e) {
    return Jn.startNull(e), Jn.endNull(e);
  }
  visitInt(t, e) {
    return ct.startInt(e), ct.addBitWidth(e, t.bitWidth), ct.addIsSigned(e, t.isSigned), ct.endInt(e);
  }
  visitFloat(t, e) {
    return At.startFloatingPoint(e), At.addPrecision(e, t.precision), At.endFloatingPoint(e);
  }
  visitBinary(t, e) {
    return Gn.startBinary(e), Gn.endBinary(e);
  }
  visitLargeBinary(t, e) {
    return qn.startLargeBinary(e), qn.endLargeBinary(e);
  }
  visitBool(t, e) {
    return Hn.startBool(e), Hn.endBool(e);
  }
  visitUtf8(t, e) {
    return Zn.startUtf8(e), Zn.endUtf8(e);
  }
  visitLargeUtf8(t, e) {
    return Kn.startLargeUtf8(e), Kn.endLargeUtf8(e);
  }
  visitDecimal(t, e) {
    return oe.startDecimal(e), oe.addScale(e, t.scale), oe.addPrecision(e, t.precision), oe.addBitWidth(e, t.bitWidth), oe.endDecimal(e);
  }
  visitDate(t, e) {
    return Ze.startDate(e), Ze.addUnit(e, t.unit), Ze.endDate(e);
  }
  visitTime(t, e) {
    return ht.startTime(e), ht.addUnit(e, t.unit), ht.addBitWidth(e, t.bitWidth), ht.endTime(e);
  }
  visitTimestamp(t, e) {
    const n = t.timezone && e.createString(t.timezone) || void 0;
    return ft.startTimestamp(e), ft.addUnit(e, t.unit), n !== void 0 && ft.addTimezone(e, n), ft.endTimestamp(e);
  }
  visitInterval(t, e) {
    return Tt.startInterval(e), Tt.addUnit(e, t.unit), Tt.endInterval(e);
  }
  visitDuration(t, e) {
    return Xe.startDuration(e), Xe.addUnit(e, t.unit), Xe.endDuration(e);
  }
  visitList(t, e) {
    return Qn.startList(e), Qn.endList(e);
  }
  visitStruct(t, e) {
    return Zt.startStruct_(e), Zt.endStruct_(e);
  }
  visitUnion(t, e) {
    nt.startTypeIdsVector(e, t.typeIds.length);
    const n = nt.createTypeIdsVector(e, t.typeIds);
    return nt.startUnion(e), nt.addMode(e, t.mode), nt.addTypeIds(e, n), nt.endUnion(e);
  }
  visitDictionary(t, e) {
    const n = this.visit(t.indices, e);
    return Pt.startDictionaryEncoding(e), Pt.addId(e, BigInt(t.id)), Pt.addIsOrdered(e, t.isOrdered), n !== void 0 && Pt.addIndexType(e, n), Pt.endDictionaryEncoding(e);
  }
  visitFixedSizeBinary(t, e) {
    return ti.startFixedSizeBinary(e), ti.addByteWidth(e, t.byteWidth), ti.endFixedSizeBinary(e);
  }
  visitFixedSizeList(t, e) {
    return ei.startFixedSizeList(e), ei.addListSize(e, t.listSize), ei.endFixedSizeList(e);
  }
  visitMap(t, e) {
    return ii.startMap(e), ii.addKeysSorted(e, t.keysSorted), ii.endMap(e);
  }
}
const Ki = new dc();
function hc(i, t = /* @__PURE__ */ new Map()) {
  return new L(yc(i, t), ri(i.metadata), t);
}
function ro(i) {
  return new lt(i.count, oo(i.columns), ao(i.columns));
}
function fc(i) {
  return new Nt(ro(i.data), i.id, i.isDelta);
}
function yc(i, t) {
  return (i.fields || []).filter(Boolean).map((e) => z.fromJSON(e, t));
}
function as(i, t) {
  return (i.children || []).filter(Boolean).map((e) => z.fromJSON(e, t));
}
function oo(i) {
  return (i || []).reduce((t, e) => [
    ...t,
    new Kt(e.count, pc(e.VALIDITY)),
    ...oo(e.children)
  ], []);
}
function ao(i, t = []) {
  for (let e = -1, n = (i || []).length; ++e < n; ) {
    const s = i[e];
    s.VALIDITY && t.push(new Ft(t.length, s.VALIDITY.length)), s.TYPE_ID && t.push(new Ft(t.length, s.TYPE_ID.length)), s.OFFSET && t.push(new Ft(t.length, s.OFFSET.length)), s.DATA && t.push(new Ft(t.length, s.DATA.length)), t = ao(s.children, t);
  }
  return t;
}
function pc(i) {
  return (i || []).reduce((t, e) => t + +(e === 0), 0);
}
function mc(i, t) {
  let e, n, s, r, o, a;
  return !t || !(r = i.dictionary) ? (o = ls(i, as(i, t)), s = new z(i.name, o, i.nullable, ri(i.metadata))) : t.has(e = r.id) ? (n = (n = r.indexType) ? cs(n) : new ze(), a = new ve(t.get(e), n, e, r.isOrdered), s = new z(i.name, a, i.nullable, ri(i.metadata))) : (n = (n = r.indexType) ? cs(n) : new ze(), t.set(e, o = ls(i, as(i, t))), a = new ve(o, n, e, r.isOrdered), s = new z(i.name, a, i.nullable, ri(i.metadata))), s || null;
}
function ri(i = []) {
  return new Map(i.map(({ key: t, value: e }) => [t, e]));
}
function cs(i) {
  return new ee(i.isSigned, i.bitWidth);
}
function ls(i, t) {
  const e = i.type.name;
  switch (e) {
    case "NONE":
      return new Gt();
    case "null":
      return new Gt();
    case "binary":
      return new hi();
    case "largebinary":
      return new fi();
    case "utf8":
      return new yi();
    case "largeutf8":
      return new pi();
    case "bool":
      return new mi();
    case "list":
      return new Si((t || [])[0]);
    case "struct":
      return new X(t || []);
    case "struct_":
      return new X(t || []);
  }
  switch (e) {
    case "int": {
      const n = i.type;
      return new ee(n.isSigned, n.bitWidth);
    }
    case "floatingpoint": {
      const n = i.type;
      return new di(Q[n.precision]);
    }
    case "decimal": {
      const n = i.type;
      return new _i(n.scale, n.precision, n.bitWidth);
    }
    case "date": {
      const n = i.type;
      return new gi(pt[n.unit]);
    }
    case "time": {
      const n = i.type;
      return new bi(g[n.unit], n.bitWidth);
    }
    case "timestamp": {
      const n = i.type;
      return new wi(g[n.unit], n.timezone);
    }
    case "interval": {
      const n = i.type;
      return new vi(Et[n.unit]);
    }
    case "duration": {
      const n = i.type;
      return new Ii(g[n.unit]);
    }
    case "union": {
      const n = i.type, [s, ...r] = (n.mode + "").toLowerCase(), o = s.toUpperCase() + r.join("");
      return new Bi(J[o], n.typeIds || [], t || []);
    }
    case "fixedsizebinary": {
      const n = i.type;
      return new Ai(n.byteWidth);
    }
    case "fixedsizelist": {
      const n = i.type;
      return new Ti(n.listSize, (t || [])[0]);
    }
    case "map": {
      const n = i.type;
      return new Di((t || [])[0], n.keysSorted);
    }
  }
  throw new Error(`Unrecognized type: "${e}"`);
}
var _c = Ss, gc = be;
class tt {
  /** @nocollapse */
  static fromJSON(t, e) {
    const n = new tt(0, G.V5, e);
    return n._createHeader = bc(t, e), n;
  }
  /** @nocollapse */
  static decode(t) {
    t = new gc(O(t));
    const e = jt.getRootAsMessage(t), n = e.bodyLength(), s = e.version(), r = e.headerType(), o = new tt(n, s, r);
    return o._createHeader = wc(e, r), o;
  }
  /** @nocollapse */
  static encode(t) {
    const e = new _c();
    let n = -1;
    return t.isSchema() ? n = L.encode(e, t.header()) : t.isRecordBatch() ? n = lt.encode(e, t.header()) : t.isDictionaryBatch() && (n = Nt.encode(e, t.header())), jt.startMessage(e), jt.addVersion(e, G.V5), jt.addHeader(e, n), jt.addHeaderType(e, t.headerType), jt.addBodyLength(e, BigInt(t.bodyLength)), jt.finishMessageBuffer(e, jt.endMessage(e)), e.asUint8Array();
  }
  /** @nocollapse */
  static from(t, e = 0) {
    if (t instanceof L)
      return new tt(0, G.V5, N.Schema, t);
    if (t instanceof lt)
      return new tt(e, G.V5, N.RecordBatch, t);
    if (t instanceof Nt)
      return new tt(e, G.V5, N.DictionaryBatch, t);
    throw new Error(`Unrecognized Message header: ${t}`);
  }
  get type() {
    return this.headerType;
  }
  get version() {
    return this._version;
  }
  get headerType() {
    return this._headerType;
  }
  get bodyLength() {
    return this._bodyLength;
  }
  header() {
    return this._createHeader();
  }
  isSchema() {
    return this.headerType === N.Schema;
  }
  isRecordBatch() {
    return this.headerType === N.RecordBatch;
  }
  isDictionaryBatch() {
    return this.headerType === N.DictionaryBatch;
  }
  constructor(t, e, n, s) {
    this._version = e, this._headerType = n, this.body = new Uint8Array(0), s && (this._createHeader = () => s), this._bodyLength = k(t);
  }
}
class lt {
  get nodes() {
    return this._nodes;
  }
  get length() {
    return this._length;
  }
  get buffers() {
    return this._buffers;
  }
  constructor(t, e, n) {
    this._nodes = e, this._buffers = n, this._length = k(t);
  }
}
class Nt {
  get id() {
    return this._id;
  }
  get data() {
    return this._data;
  }
  get isDelta() {
    return this._isDelta;
  }
  get length() {
    return this.data.length;
  }
  get nodes() {
    return this.data.nodes;
  }
  get buffers() {
    return this.data.buffers;
  }
  constructor(t, e, n = !1) {
    this._data = t, this._isDelta = n, this._id = k(e);
  }
}
class Ft {
  constructor(t, e) {
    this.offset = k(t), this.length = k(e);
  }
}
class Kt {
  constructor(t, e) {
    this.length = k(t), this.nullCount = k(e);
  }
}
function bc(i, t) {
  return (() => {
    switch (t) {
      case N.Schema:
        return L.fromJSON(i);
      case N.RecordBatch:
        return lt.fromJSON(i);
      case N.DictionaryBatch:
        return Nt.fromJSON(i);
    }
    throw new Error(`Unrecognized Message type: { name: ${N[t]}, type: ${t} }`);
  });
}
function wc(i, t) {
  return (() => {
    switch (t) {
      case N.Schema:
        return L.decode(i.header(new It()), /* @__PURE__ */ new Map(), i.version());
      case N.RecordBatch:
        return lt.decode(i.header(new Lt()), i.version());
      case N.DictionaryBatch:
        return Nt.decode(i.header(new se()), i.version());
    }
    throw new Error(`Unrecognized Message type: { name: ${N[t]}, type: ${t} }`);
  });
}
z.encode = Nc;
z.decode = Oc;
z.fromJSON = mc;
L.encode = Ec;
L.decode = vc;
L.fromJSON = hc;
lt.encode = Rc;
lt.decode = Ic;
lt.fromJSON = ro;
Nt.encode = Lc;
Nt.decode = Sc;
Nt.fromJSON = fc;
Kt.encode = Uc;
Kt.decode = Ac;
Ft.encode = Mc;
Ft.decode = Bc;
function vc(i, t = /* @__PURE__ */ new Map(), e = G.V5) {
  const n = Fc(i, t);
  return new L(n, oi(i), t, e);
}
function Ic(i, t = G.V5) {
  if (i.compression() !== null)
    throw new Error("Record batch compression not implemented");
  return new lt(i.length(), Tc(i), Dc(i, t));
}
function Sc(i, t = G.V5) {
  return new Nt(lt.decode(i.data(), t), i.id(), i.isDelta());
}
function Bc(i) {
  return new Ft(i.offset(), i.length());
}
function Ac(i) {
  return new Kt(i.length(), i.nullCount());
}
function Tc(i) {
  const t = [];
  for (let e, n = -1, s = -1, r = i.nodesLength(); ++n < r; )
    (e = i.nodes(n)) && (t[++s] = Kt.decode(e));
  return t;
}
function Dc(i, t) {
  const e = [];
  for (let n, s = -1, r = -1, o = i.buffersLength(); ++s < o; )
    (n = i.buffers(s)) && (t < G.V4 && (n.bb_pos += 8 * (s + 1)), e[++r] = Ft.decode(n));
  return e;
}
function Fc(i, t) {
  const e = [];
  for (let n, s = -1, r = -1, o = i.fieldsLength(); ++s < o; )
    (n = i.fields(s)) && (e[++r] = z.decode(n, t));
  return e;
}
function us(i, t) {
  const e = [];
  for (let n, s = -1, r = -1, o = i.childrenLength(); ++s < o; )
    (n = i.children(s)) && (e[++r] = z.decode(n, t));
  return e;
}
function Oc(i, t) {
  let e, n, s, r, o, a;
  return !t || !(a = i.dictionary()) ? (s = hs(i, us(i, t)), n = new z(i.name(), s, i.nullable(), oi(i))) : t.has(e = k(a.id())) ? (r = (r = a.indexType()) ? ds(r) : new ze(), o = new ve(t.get(e), r, e, a.isOrdered()), n = new z(i.name(), o, i.nullable(), oi(i))) : (r = (r = a.indexType()) ? ds(r) : new ze(), t.set(e, s = hs(i, us(i, t))), o = new ve(s, r, e, a.isOrdered()), n = new z(i.name(), o, i.nullable(), oi(i))), n || null;
}
function oi(i) {
  const t = /* @__PURE__ */ new Map();
  if (i)
    for (let e, n, s = -1, r = Math.trunc(i.customMetadataLength()); ++s < r; )
      (e = i.customMetadata(s)) && (n = e.key()) != null && t.set(n, e.value());
  return t;
}
function ds(i) {
  return new ee(i.isSigned(), i.bitWidth());
}
function hs(i, t) {
  const e = i.typeType();
  switch (e) {
    case x.NONE:
      return new Gt();
    case x.Null:
      return new Gt();
    case x.Binary:
      return new hi();
    case x.LargeBinary:
      return new fi();
    case x.Utf8:
      return new yi();
    case x.LargeUtf8:
      return new pi();
    case x.Bool:
      return new mi();
    case x.List:
      return new Si((t || [])[0]);
    case x.Struct_:
      return new X(t || []);
  }
  switch (e) {
    case x.Int: {
      const n = i.type(new ct());
      return new ee(n.isSigned(), n.bitWidth());
    }
    case x.FloatingPoint: {
      const n = i.type(new At());
      return new di(n.precision());
    }
    case x.Decimal: {
      const n = i.type(new oe());
      return new _i(n.scale(), n.precision(), n.bitWidth());
    }
    case x.Date: {
      const n = i.type(new Ze());
      return new gi(n.unit());
    }
    case x.Time: {
      const n = i.type(new ht());
      return new bi(n.unit(), n.bitWidth());
    }
    case x.Timestamp: {
      const n = i.type(new ft());
      return new wi(n.unit(), n.timezone());
    }
    case x.Interval: {
      const n = i.type(new Tt());
      return new vi(n.unit());
    }
    case x.Duration: {
      const n = i.type(new Xe());
      return new Ii(n.unit());
    }
    case x.Union: {
      const n = i.type(new nt());
      return new Bi(n.mode(), n.typeIdsArray() || [], t || []);
    }
    case x.FixedSizeBinary: {
      const n = i.type(new ti());
      return new Ai(n.byteWidth());
    }
    case x.FixedSizeList: {
      const n = i.type(new ei());
      return new Ti(n.listSize(), (t || [])[0]);
    }
    case x.Map: {
      const n = i.type(new ii());
      return new Di((t || [])[0], n.keysSorted());
    }
  }
  throw new Error(`Unrecognized type: "${x[e]}" (${e})`);
}
function Ec(i, t) {
  const e = t.fields.map((r) => z.encode(i, r));
  It.startFieldsVector(i, e.length);
  const n = It.createFieldsVector(i, e), s = t.metadata && t.metadata.size > 0 ? It.createCustomMetadataVector(i, [...t.metadata].map(([r, o]) => {
    const a = i.createString(`${r}`), c = i.createString(`${o}`);
    return q.startKeyValue(i), q.addKey(i, a), q.addValue(i, c), q.endKeyValue(i);
  })) : -1;
  return It.startSchema(i), It.addFields(i, n), It.addEndianness(i, Cc ? we.Little : we.Big), s !== -1 && It.addCustomMetadata(i, s), It.endSchema(i);
}
function Nc(i, t) {
  let e = -1, n = -1, s = -1;
  const r = t.type;
  let o = t.typeId;
  f.isDictionary(r) ? (o = r.dictionary.typeId, s = Ki.visit(r, i), n = Ki.visit(r.dictionary, i)) : n = Ki.visit(r, i);
  const a = (r.children || []).map((d) => z.encode(i, d)), c = ut.createChildrenVector(i, a), u = t.metadata && t.metadata.size > 0 ? ut.createCustomMetadataVector(i, [...t.metadata].map(([d, h]) => {
    const V = i.createString(`${d}`), F = i.createString(`${h}`);
    return q.startKeyValue(i), q.addKey(i, V), q.addValue(i, F), q.endKeyValue(i);
  })) : -1;
  return t.name && (e = i.createString(t.name)), ut.startField(i), ut.addType(i, n), ut.addTypeType(i, o), ut.addChildren(i, c), ut.addNullable(i, !!t.nullable), e !== -1 && ut.addName(i, e), s !== -1 && ut.addDictionary(i, s), u !== -1 && ut.addCustomMetadata(i, u), ut.endField(i);
}
function Rc(i, t) {
  const e = t.nodes || [], n = t.buffers || [];
  Lt.startNodesVector(i, e.length);
  for (const o of e.slice().reverse())
    Kt.encode(i, o);
  const s = i.endVector();
  Lt.startBuffersVector(i, n.length);
  for (const o of n.slice().reverse())
    Ft.encode(i, o);
  const r = i.endVector();
  return Lt.startRecordBatch(i), Lt.addLength(i, BigInt(t.length)), Lt.addNodes(i, s), Lt.addBuffers(i, r), Lt.endRecordBatch(i);
}
function Lc(i, t) {
  const e = lt.encode(i, t.data);
  return se.startDictionaryBatch(i), se.addId(i, BigInt(t.id)), se.addIsDelta(i, t.isDelta), se.addData(i, e), se.endDictionaryBatch(i);
}
function Uc(i, t) {
  return Ts.createFieldNode(i, BigInt(t.length), BigInt(t.nullCount));
}
function Mc(i, t) {
  return As.createBuffer(i, BigInt(t.offset), BigInt(t.length));
}
const Cc = (() => {
  const i = new ArrayBuffer(2);
  return new DataView(i).setInt16(
    0,
    256,
    !0
    /* littleEndian */
  ), new Int16Array(i)[0] === 256;
})(), Rn = (i) => `Expected ${N[i]} Message in stream, but was null or length 0.`, Ln = (i) => `Header pointer of flatbuffer-encoded ${N[i]} Message is null or length 0.`, co = (i, t) => `Expected to read ${i} metadata bytes, but only read ${t}.`, lo = (i, t) => `Expected to read ${i} bytes for message body, but only read ${t}.`;
class uo {
  constructor(t) {
    this.source = t instanceof Li ? t : new Li(t);
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    let t;
    return (t = this.readMetadataLength()).done || t.value === -1 && (t = this.readMetadataLength()).done || (t = this.readMetadata(t.value)).done ? $ : t;
  }
  throw(t) {
    return this.source.throw(t);
  }
  return(t) {
    return this.source.return(t);
  }
  readMessage(t) {
    let e;
    if ((e = this.next()).done)
      return null;
    if (t != null && e.value.headerType !== t)
      throw new Error(Rn(t));
    return e.value;
  }
  readMessageBody(t) {
    if (t <= 0)
      return new Uint8Array(0);
    const e = O(this.source.read(t));
    if (e.byteLength < t)
      throw new Error(lo(t, e.byteLength));
    return (
      /* 1. */
      e.byteOffset % 8 === 0 && /* 2. */
      e.byteOffset + e.byteLength <= e.buffer.byteLength ? e : e.slice()
    );
  }
  readSchema(t = !1) {
    const e = N.Schema, n = this.readMessage(e), s = n?.header();
    if (t && !s)
      throw new Error(Ln(e));
    return s;
  }
  readMetadataLength() {
    const t = this.source.read(ji), e = t && new be(t), n = e?.readInt32(0) || 0;
    return { done: n === 0, value: n };
  }
  readMetadata(t) {
    const e = this.source.read(t);
    if (!e)
      return $;
    if (e.byteLength < t)
      throw new Error(co(t, e.byteLength));
    return { done: !1, value: tt.decode(e) };
  }
}
class Pc {
  constructor(t, e) {
    this.source = t instanceof Ie ? t : _s(t) ? new Ui(t, e) : new Ie(t);
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  next() {
    return B(this, void 0, void 0, function* () {
      let t;
      return (t = yield this.readMetadataLength()).done || t.value === -1 && (t = yield this.readMetadataLength()).done || (t = yield this.readMetadata(t.value)).done ? $ : t;
    });
  }
  throw(t) {
    return B(this, void 0, void 0, function* () {
      return yield this.source.throw(t);
    });
  }
  return(t) {
    return B(this, void 0, void 0, function* () {
      return yield this.source.return(t);
    });
  }
  readMessage(t) {
    return B(this, void 0, void 0, function* () {
      let e;
      if ((e = yield this.next()).done)
        return null;
      if (t != null && e.value.headerType !== t)
        throw new Error(Rn(t));
      return e.value;
    });
  }
  readMessageBody(t) {
    return B(this, void 0, void 0, function* () {
      if (t <= 0)
        return new Uint8Array(0);
      const e = O(yield this.source.read(t));
      if (e.byteLength < t)
        throw new Error(lo(t, e.byteLength));
      return (
        /* 1. */
        e.byteOffset % 8 === 0 && /* 2. */
        e.byteOffset + e.byteLength <= e.buffer.byteLength ? e : e.slice()
      );
    });
  }
  readSchema() {
    return B(this, arguments, void 0, function* (t = !1) {
      const e = N.Schema, n = yield this.readMessage(e), s = n?.header();
      if (t && !s)
        throw new Error(Ln(e));
      return s;
    });
  }
  readMetadataLength() {
    return B(this, void 0, void 0, function* () {
      const t = yield this.source.read(ji), e = t && new be(t), n = e?.readInt32(0) || 0;
      return { done: n === 0, value: n };
    });
  }
  readMetadata(t) {
    return B(this, void 0, void 0, function* () {
      const e = yield this.source.read(t);
      if (!e)
        return $;
      if (e.byteLength < t)
        throw new Error(co(t, e.byteLength));
      return { done: !1, value: tt.decode(e) };
    });
  }
}
class kc extends uo {
  constructor(t) {
    super(new Uint8Array(0)), this._schema = !1, this._body = [], this._batchIndex = 0, this._dictionaryIndex = 0, this._json = t instanceof ss ? t : new ss(t);
  }
  next() {
    const { _json: t } = this;
    if (!this._schema)
      return this._schema = !0, { done: !1, value: tt.fromJSON(t.schema, N.Schema) };
    if (this._dictionaryIndex < t.dictionaries.length) {
      const e = t.dictionaries[this._dictionaryIndex++];
      return this._body = e.data.columns, { done: !1, value: tt.fromJSON(e, N.DictionaryBatch) };
    }
    if (this._batchIndex < t.batches.length) {
      const e = t.batches[this._batchIndex++];
      return this._body = e.columns, { done: !1, value: tt.fromJSON(e, N.RecordBatch) };
    }
    return this._body = [], $;
  }
  readMessageBody(t) {
    return e(this._body);
    function e(n) {
      return (n || []).reduce((s, r) => [
        ...s,
        ...r.VALIDITY && [r.VALIDITY] || [],
        ...r.TYPE_ID && [r.TYPE_ID] || [],
        ...r.OFFSET && [r.OFFSET] || [],
        ...r.DATA && [r.DATA] || [],
        ...e(r.children)
      ], []);
    }
  }
  readMessage(t) {
    let e;
    if ((e = this.next()).done)
      return null;
    if (t != null && e.value.headerType !== t)
      throw new Error(Rn(t));
    return e.value;
  }
  readSchema() {
    const t = N.Schema, e = this.readMessage(t), n = e?.header();
    if (!e || !n)
      throw new Error(Ln(t));
    return n;
  }
}
const ji = 4, dn = "ARROW1", je = new Uint8Array(dn.length);
for (let i = 0; i < dn.length; i += 1)
  je[i] = dn.codePointAt(i);
function Un(i, t = 0) {
  for (let e = -1, n = je.length; ++e < n; )
    if (je[e] !== i[t + e])
      return !1;
  return !0;
}
const He = je.length, ho = He + ji, xc = He * 2 + ji;
class yt extends Tn {
  constructor(t) {
    super(), this._impl = t;
  }
  get closed() {
    return this._impl.closed;
  }
  get schema() {
    return this._impl.schema;
  }
  get autoDestroy() {
    return this._impl.autoDestroy;
  }
  get dictionaries() {
    return this._impl.dictionaries;
  }
  get numDictionaries() {
    return this._impl.numDictionaries;
  }
  get numRecordBatches() {
    return this._impl.numRecordBatches;
  }
  get footer() {
    return this._impl.isFile() ? this._impl.footer : null;
  }
  isSync() {
    return this._impl.isSync();
  }
  isAsync() {
    return this._impl.isAsync();
  }
  isFile() {
    return this._impl.isFile();
  }
  isStream() {
    return this._impl.isStream();
  }
  next() {
    return this._impl.next();
  }
  throw(t) {
    return this._impl.throw(t);
  }
  return(t) {
    return this._impl.return(t);
  }
  cancel() {
    return this._impl.cancel();
  }
  reset(t) {
    return this._impl.reset(t), this._DOMStream = void 0, this._nodeStream = void 0, this;
  }
  open(t) {
    const e = this._impl.open(t);
    return te(e) ? e.then(() => this) : this;
  }
  readRecordBatch(t) {
    return this._impl.isFile() ? this._impl.readRecordBatch(t) : null;
  }
  [Symbol.iterator]() {
    return this._impl[Symbol.iterator]();
  }
  [Symbol.asyncIterator]() {
    return this._impl[Symbol.asyncIterator]();
  }
  toDOMStream() {
    return dt.toDOMStream(this.isSync() ? { [Symbol.iterator]: () => this } : { [Symbol.asyncIterator]: () => this });
  }
  toNodeStream() {
    return dt.toNodeStream(this.isSync() ? { [Symbol.iterator]: () => this } : { [Symbol.asyncIterator]: () => this }, { objectMode: !0 });
  }
  /** @nocollapse */
  // @ts-ignore
  static throughNode(t) {
    throw new Error('"throughNode" not available in this environment');
  }
  /** @nocollapse */
  static throughDOM(t, e) {
    throw new Error('"throughDOM" not available in this environment');
  }
  /** @nocollapse */
  static from(t) {
    return t instanceof yt ? t : tn(t) ? $c(t) : _s(t) ? Gc(t) : te(t) ? B(this, void 0, void 0, function* () {
      return yield yt.from(yield t);
    }) : gs(t) || pn(t) || bs(t) || Be(t) ? Wc(new Ie(t)) : Yc(new Li(t));
  }
  /** @nocollapse */
  static readAll(t) {
    return t instanceof yt ? t.isSync() ? fs(t) : ys(t) : tn(t) || ArrayBuffer.isView(t) || $e(t) || ms(t) ? fs(t) : ys(t);
  }
}
class Mi extends yt {
  constructor(t) {
    super(t), this._impl = t;
  }
  readAll() {
    return [...this];
  }
  [Symbol.iterator]() {
    return this._impl[Symbol.iterator]();
  }
  [Symbol.asyncIterator]() {
    return Dt(this, arguments, function* () {
      yield A(yield* Je(Xt(this[Symbol.iterator]())));
    });
  }
}
class Ci extends yt {
  constructor(t) {
    super(t), this._impl = t;
  }
  readAll() {
    return B(this, void 0, void 0, function* () {
      var t, e, n, s;
      const r = new Array();
      try {
        for (var o = !0, a = Xt(this), c; c = yield a.next(), t = c.done, !t; o = !0) {
          s = c.value, o = !1;
          const u = s;
          r.push(u);
        }
      } catch (u) {
        e = { error: u };
      } finally {
        try {
          !o && !t && (n = a.return) && (yield n.call(a));
        } finally {
          if (e) throw e.error;
        }
      }
      return r;
    });
  }
  [Symbol.iterator]() {
    throw new Error("AsyncRecordBatchStreamReader is not Iterable");
  }
  [Symbol.asyncIterator]() {
    return this._impl[Symbol.asyncIterator]();
  }
}
class fo extends Mi {
  constructor(t) {
    super(t), this._impl = t;
  }
}
class zc extends Ci {
  constructor(t) {
    super(t), this._impl = t;
  }
}
class yo {
  get numDictionaries() {
    return this._dictionaryIndex;
  }
  get numRecordBatches() {
    return this._recordBatchIndex;
  }
  constructor(t = /* @__PURE__ */ new Map()) {
    this.closed = !1, this.autoDestroy = !0, this._dictionaryIndex = 0, this._recordBatchIndex = 0, this.dictionaries = t;
  }
  isSync() {
    return !1;
  }
  isAsync() {
    return !1;
  }
  isFile() {
    return !1;
  }
  isStream() {
    return !1;
  }
  reset(t) {
    return this._dictionaryIndex = 0, this._recordBatchIndex = 0, this.schema = t, this.dictionaries = /* @__PURE__ */ new Map(), this;
  }
  _loadRecordBatch(t, e) {
    const n = this._loadVectors(t, e, this.schema.fields), s = D({ type: new X(this.schema.fields), length: t.length, children: n });
    return new st(this.schema, s);
  }
  _loadDictionaryBatch(t, e) {
    const { id: n, isDelta: s } = t, { dictionaries: r, schema: o } = this, a = r.get(n), c = o.dictionaries.get(n), u = this._loadVectors(t.data, e, [c]);
    return (a && s ? a.concat(new R(u)) : new R(u)).memoize();
  }
  _loadVectors(t, e, n) {
    return new eo(e, t.nodes, t.buffers, this.dictionaries, this.schema.metadataVersion).visitMany(n);
  }
}
class Pi extends yo {
  constructor(t, e) {
    super(e), this._reader = tn(t) ? new kc(this._handle = t) : new uo(this._handle = t);
  }
  isSync() {
    return !0;
  }
  isStream() {
    return !0;
  }
  [Symbol.iterator]() {
    return this;
  }
  cancel() {
    !this.closed && (this.closed = !0) && (this.reset()._reader.return(), this._reader = null, this.dictionaries = null);
  }
  open(t) {
    return this.closed || (this.autoDestroy = mo(this, t), this.schema || (this.schema = this._reader.readSchema()) || this.cancel()), this;
  }
  throw(t) {
    return !this.closed && this.autoDestroy && (this.closed = !0) ? this.reset()._reader.throw(t) : $;
  }
  return(t) {
    return !this.closed && this.autoDestroy && (this.closed = !0) ? this.reset()._reader.return(t) : $;
  }
  next() {
    if (this.closed)
      return $;
    let t;
    const { _reader: e } = this;
    for (; t = this._readNextMessageAndValidate(); )
      if (t.isSchema())
        this.reset(t.header());
      else if (t.isRecordBatch()) {
        this._recordBatchIndex++;
        const n = t.header(), s = e.readMessageBody(t.bodyLength);
        return { done: !1, value: this._loadRecordBatch(n, s) };
      } else if (t.isDictionaryBatch()) {
        this._dictionaryIndex++;
        const n = t.header(), s = e.readMessageBody(t.bodyLength), r = this._loadDictionaryBatch(n, s);
        this.dictionaries.set(n.id, r);
      }
    return this.schema && this._recordBatchIndex === 0 ? (this._recordBatchIndex++, { done: !1, value: new Nn(this.schema) }) : this.return();
  }
  _readNextMessageAndValidate(t) {
    return this._reader.readMessage(t);
  }
}
class ki extends yo {
  constructor(t, e) {
    super(e), this._reader = new Pc(this._handle = t);
  }
  isAsync() {
    return !0;
  }
  isStream() {
    return !0;
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  cancel() {
    return B(this, void 0, void 0, function* () {
      !this.closed && (this.closed = !0) && (yield this.reset()._reader.return(), this._reader = null, this.dictionaries = null);
    });
  }
  open(t) {
    return B(this, void 0, void 0, function* () {
      return this.closed || (this.autoDestroy = mo(this, t), this.schema || (this.schema = yield this._reader.readSchema()) || (yield this.cancel())), this;
    });
  }
  throw(t) {
    return B(this, void 0, void 0, function* () {
      return !this.closed && this.autoDestroy && (this.closed = !0) ? yield this.reset()._reader.throw(t) : $;
    });
  }
  return(t) {
    return B(this, void 0, void 0, function* () {
      return !this.closed && this.autoDestroy && (this.closed = !0) ? yield this.reset()._reader.return(t) : $;
    });
  }
  next() {
    return B(this, void 0, void 0, function* () {
      if (this.closed)
        return $;
      let t;
      const { _reader: e } = this;
      for (; t = yield this._readNextMessageAndValidate(); )
        if (t.isSchema())
          yield this.reset(t.header());
        else if (t.isRecordBatch()) {
          this._recordBatchIndex++;
          const n = t.header(), s = yield e.readMessageBody(t.bodyLength);
          return { done: !1, value: this._loadRecordBatch(n, s) };
        } else if (t.isDictionaryBatch()) {
          this._dictionaryIndex++;
          const n = t.header(), s = yield e.readMessageBody(t.bodyLength), r = this._loadDictionaryBatch(n, s);
          this.dictionaries.set(n.id, r);
        }
      return this.schema && this._recordBatchIndex === 0 ? (this._recordBatchIndex++, { done: !1, value: new Nn(this.schema) }) : yield this.return();
    });
  }
  _readNextMessageAndValidate(t) {
    return B(this, void 0, void 0, function* () {
      return yield this._reader.readMessage(t);
    });
  }
}
class po extends Pi {
  get footer() {
    return this._footer;
  }
  get numDictionaries() {
    return this._footer ? this._footer.numDictionaries : 0;
  }
  get numRecordBatches() {
    return this._footer ? this._footer.numRecordBatches : 0;
  }
  constructor(t, e) {
    super(t instanceof rs ? t : new rs(t), e);
  }
  isSync() {
    return !0;
  }
  isFile() {
    return !0;
  }
  open(t) {
    if (!this.closed && !this._footer) {
      this.schema = (this._footer = this._readFooter()).schema;
      for (const e of this._footer.dictionaryBatches())
        e && this._readDictionaryBatch(this._dictionaryIndex++);
    }
    return super.open(t);
  }
  readRecordBatch(t) {
    var e;
    if (this.closed)
      return null;
    this._footer || this.open();
    const n = (e = this._footer) === null || e === void 0 ? void 0 : e.getRecordBatch(t);
    if (n && this._handle.seek(n.offset)) {
      const s = this._reader.readMessage(N.RecordBatch);
      if (s?.isRecordBatch()) {
        const r = s.header(), o = this._reader.readMessageBody(s.bodyLength);
        return this._loadRecordBatch(r, o);
      }
    }
    return null;
  }
  _readDictionaryBatch(t) {
    var e;
    const n = (e = this._footer) === null || e === void 0 ? void 0 : e.getDictionaryBatch(t);
    if (n && this._handle.seek(n.offset)) {
      const s = this._reader.readMessage(N.DictionaryBatch);
      if (s?.isDictionaryBatch()) {
        const r = s.header(), o = this._reader.readMessageBody(s.bodyLength), a = this._loadDictionaryBatch(r, o);
        this.dictionaries.set(r.id, a);
      }
    }
  }
  _readFooter() {
    const { _handle: t } = this, e = t.size - ho, n = t.readInt32(e), s = t.readAt(e - n, n);
    return Ve.decode(s);
  }
  _readNextMessageAndValidate(t) {
    var e;
    if (this._footer || this.open(), this._footer && this._recordBatchIndex < this.numRecordBatches) {
      const n = (e = this._footer) === null || e === void 0 ? void 0 : e.getRecordBatch(this._recordBatchIndex);
      if (n && this._handle.seek(n.offset))
        return this._reader.readMessage(t);
    }
    return null;
  }
}
class Vc extends ki {
  get footer() {
    return this._footer;
  }
  get numDictionaries() {
    return this._footer ? this._footer.numDictionaries : 0;
  }
  get numRecordBatches() {
    return this._footer ? this._footer.numRecordBatches : 0;
  }
  constructor(t, ...e) {
    const n = typeof e[0] != "number" ? e.shift() : void 0, s = e[0] instanceof Map ? e.shift() : void 0;
    super(t instanceof Ui ? t : new Ui(t, n), s);
  }
  isFile() {
    return !0;
  }
  isAsync() {
    return !0;
  }
  open(t) {
    const e = Object.create(null, {
      open: { get: () => super.open }
    });
    return B(this, void 0, void 0, function* () {
      if (!this.closed && !this._footer) {
        this.schema = (this._footer = yield this._readFooter()).schema;
        for (const n of this._footer.dictionaryBatches())
          n && (yield this._readDictionaryBatch(this._dictionaryIndex++));
      }
      return yield e.open.call(this, t);
    });
  }
  readRecordBatch(t) {
    return B(this, void 0, void 0, function* () {
      var e;
      if (this.closed)
        return null;
      this._footer || (yield this.open());
      const n = (e = this._footer) === null || e === void 0 ? void 0 : e.getRecordBatch(t);
      if (n && (yield this._handle.seek(n.offset))) {
        const s = yield this._reader.readMessage(N.RecordBatch);
        if (s?.isRecordBatch()) {
          const r = s.header(), o = yield this._reader.readMessageBody(s.bodyLength);
          return this._loadRecordBatch(r, o);
        }
      }
      return null;
    });
  }
  _readDictionaryBatch(t) {
    return B(this, void 0, void 0, function* () {
      var e;
      const n = (e = this._footer) === null || e === void 0 ? void 0 : e.getDictionaryBatch(t);
      if (n && (yield this._handle.seek(n.offset))) {
        const s = yield this._reader.readMessage(N.DictionaryBatch);
        if (s?.isDictionaryBatch()) {
          const r = s.header(), o = yield this._reader.readMessageBody(s.bodyLength), a = this._loadDictionaryBatch(r, o);
          this.dictionaries.set(r.id, a);
        }
      }
    });
  }
  _readFooter() {
    return B(this, void 0, void 0, function* () {
      const { _handle: t } = this;
      t._pending && (yield t._pending);
      const e = t.size - ho, n = yield t.readInt32(e), s = yield t.readAt(e - n, n);
      return Ve.decode(s);
    });
  }
  _readNextMessageAndValidate(t) {
    return B(this, void 0, void 0, function* () {
      if (this._footer || (yield this.open()), this._footer && this._recordBatchIndex < this.numRecordBatches) {
        const e = this._footer.getRecordBatch(this._recordBatchIndex);
        if (e && (yield this._handle.seek(e.offset)))
          return yield this._reader.readMessage(t);
      }
      return null;
    });
  }
}
class jc extends Pi {
  constructor(t, e) {
    super(t, e);
  }
  _loadVectors(t, e, n) {
    return new ec(e, t.nodes, t.buffers, this.dictionaries, this.schema.metadataVersion).visitMany(n);
  }
}
function mo(i, t) {
  return t && typeof t.autoDestroy == "boolean" ? t.autoDestroy : i.autoDestroy;
}
function* fs(i) {
  const t = yt.from(i);
  try {
    if (!t.open({ autoDestroy: !1 }).closed)
      do
        yield t;
      while (!t.reset().open().closed);
  } finally {
    t.cancel();
  }
}
function ys(i) {
  return Dt(this, arguments, function* () {
    const e = yield A(yt.from(i));
    try {
      if (!(yield A(e.open({ autoDestroy: !1 }))).closed)
        do
          yield yield A(e);
        while (!(yield A(e.reset().open())).closed);
    } finally {
      yield A(e.cancel());
    }
  });
}
function $c(i) {
  return new Mi(new jc(i));
}
function Yc(i) {
  const t = i.peek(He + 7 & -8);
  return t && t.byteLength >= 4 ? Un(t) ? new fo(new po(i.read())) : new Mi(new Pi(i)) : new Mi(new Pi((function* () {
  })()));
}
function Wc(i) {
  return B(this, void 0, void 0, function* () {
    const t = yield i.peek(He + 7 & -8);
    return t && t.byteLength >= 4 ? Un(t) ? new fo(new po(yield i.read())) : new Ci(new ki(i)) : new Ci(new ki((function() {
      return Dt(this, arguments, function* () {
      });
    })()));
  });
}
function Gc(i) {
  return B(this, void 0, void 0, function* () {
    const { size: t } = yield i.stat(), e = new Ui(i, t);
    return t >= xc && Un(yield e.readAt(0, He + 7 & -8)) ? new zc(new Vc(e)) : new Ci(new ki(e));
  });
}
class Y extends T {
  /** @nocollapse */
  static assemble(...t) {
    const e = (s) => s.flatMap((r) => Array.isArray(r) ? e(r) : r instanceof st ? r.data.children : r.data), n = new Y();
    return n.visitMany(e(t)), n;
  }
  constructor() {
    super(), this._byteLength = 0, this._nodes = [], this._buffers = [], this._bufferRegions = [];
  }
  visit(t) {
    if (t instanceof R)
      return this.visitMany(t.data), this;
    const { type: e } = t;
    if (!f.isDictionary(e)) {
      const { length: n } = t;
      if (n > 2147483647)
        throw new RangeError("Cannot write arrays larger than 2^31 - 1 in length");
      if (f.isUnion(e))
        this.nodes.push(new Kt(n, 0));
      else {
        const { nullCount: s } = t;
        f.isNull(e) || gt.call(this, s <= 0 ? new Uint8Array(0) : Fi(t.offset, n, t.nullBitmap)), this.nodes.push(new Kt(n, s));
      }
    }
    return super.visit(t);
  }
  visitNull(t) {
    return this;
  }
  visitDictionary(t) {
    return this.visit(t.clone(t.type.indices));
  }
  get nodes() {
    return this._nodes;
  }
  get buffers() {
    return this._buffers;
  }
  get byteLength() {
    return this._byteLength;
  }
  get bufferRegions() {
    return this._bufferRegions;
  }
}
function gt(i) {
  const t = i.byteLength + 7 & -8;
  return this.buffers.push(i), this.bufferRegions.push(new Ft(this._byteLength, t)), this._byteLength += t, this;
}
function Hc(i) {
  var t;
  const { type: e, length: n, typeIds: s, valueOffsets: r } = i;
  if (gt.call(this, s), e.mode === J.Sparse)
    return hn.call(this, i);
  if (e.mode === J.Dense) {
    if (i.offset <= 0)
      return gt.call(this, r), hn.call(this, i);
    {
      const o = new Int32Array(n), a = /* @__PURE__ */ Object.create(null), c = /* @__PURE__ */ Object.create(null);
      for (let u, d, h = -1; ++h < n; )
        (u = s[h]) !== void 0 && ((d = a[u]) === void 0 && (d = a[u] = r[h]), o[h] = r[h] - d, c[u] = ((t = c[u]) !== null && t !== void 0 ? t : 0) + 1);
      gt.call(this, o), this.visitMany(i.children.map((u, d) => {
        const h = e.typeIds[d], V = a[h], F = c[h];
        return u.slice(V, Math.min(n, F));
      }));
    }
  }
  return this;
}
function qc(i) {
  let t;
  return i.nullCount >= i.length ? gt.call(this, new Uint8Array(0)) : (t = i.values) instanceof Uint8Array ? gt.call(this, Fi(i.offset, i.length, t)) : gt.call(this, Oi(i.values));
}
function zt(i) {
  return gt.call(this, i.values.subarray(0, i.length * i.stride));
}
function $i(i) {
  const { length: t, values: e, valueOffsets: n } = i, s = k(n[0]), r = k(n[t]), o = Math.min(r - s, e.byteLength - s);
  return gt.call(this, vs(-s, t + 1, n)), gt.call(this, e.subarray(s, s + o)), this;
}
function Mn(i) {
  const { length: t, valueOffsets: e } = i;
  if (e) {
    const { [0]: n, [t]: s } = e;
    return gt.call(this, vs(-n, t + 1, e)), this.visit(i.children[0].slice(n, s - n));
  }
  return this.visit(i.children[0]);
}
function hn(i) {
  return this.visitMany(i.type.children.map((t, e) => i.children[e]).filter(Boolean))[0];
}
Y.prototype.visitBool = qc;
Y.prototype.visitInt = zt;
Y.prototype.visitFloat = zt;
Y.prototype.visitUtf8 = $i;
Y.prototype.visitLargeUtf8 = $i;
Y.prototype.visitBinary = $i;
Y.prototype.visitLargeBinary = $i;
Y.prototype.visitFixedSizeBinary = zt;
Y.prototype.visitDate = zt;
Y.prototype.visitTimestamp = zt;
Y.prototype.visitTime = zt;
Y.prototype.visitDecimal = zt;
Y.prototype.visitList = Mn;
Y.prototype.visitStruct = hn;
Y.prototype.visitUnion = Hc;
Y.prototype.visitInterval = zt;
Y.prototype.visitDuration = zt;
Y.prototype.visitFixedSizeList = Mn;
Y.prototype.visitMap = Mn;
class _o extends Tn {
  /** @nocollapse */
  // @ts-ignore
  static throughNode(t) {
    throw new Error('"throughNode" not available in this environment');
  }
  /** @nocollapse */
  static throughDOM(t, e) {
    throw new Error('"throughDOM" not available in this environment');
  }
  constructor(t) {
    super(), this._position = 0, this._started = !1, this._sink = new si(), this._schema = null, this._dictionaryBlocks = [], this._recordBatchBlocks = [], this._seenDictionaries = /* @__PURE__ */ new Map(), this._dictionaryDeltaOffsets = /* @__PURE__ */ new Map(), rt(t) || (t = { autoDestroy: !0, writeLegacyIpcFormat: !1 }), this._autoDestroy = typeof t.autoDestroy == "boolean" ? t.autoDestroy : !0, this._writeLegacyIpcFormat = typeof t.writeLegacyIpcFormat == "boolean" ? t.writeLegacyIpcFormat : !1;
  }
  toString(t = !1) {
    return this._sink.toString(t);
  }
  toUint8Array(t = !1) {
    return this._sink.toUint8Array(t);
  }
  writeAll(t) {
    return te(t) ? t.then((e) => this.writeAll(e)) : Be(t) ? xn(this, t) : kn(this, t);
  }
  get closed() {
    return this._sink.closed;
  }
  [Symbol.asyncIterator]() {
    return this._sink[Symbol.asyncIterator]();
  }
  toDOMStream(t) {
    return this._sink.toDOMStream(t);
  }
  toNodeStream(t) {
    return this._sink.toNodeStream(t);
  }
  close() {
    return this.reset()._sink.close();
  }
  abort(t) {
    return this.reset()._sink.abort(t);
  }
  finish() {
    return this._autoDestroy ? this.close() : this.reset(this._sink, this._schema), this;
  }
  reset(t = this._sink, e = null) {
    return t === this._sink || t instanceof si ? this._sink = t : (this._sink = new si(), t && Ao(t) ? this.toDOMStream({ type: "bytes" }).pipeTo(t) : t && To(t) && this.toNodeStream({ objectMode: !1 }).pipe(t)), this._started && this._schema && this._writeFooter(this._schema), this._started = !1, this._dictionaryBlocks = [], this._recordBatchBlocks = [], this._seenDictionaries = /* @__PURE__ */ new Map(), this._dictionaryDeltaOffsets = /* @__PURE__ */ new Map(), (!e || !un(e, this._schema)) && (e == null ? (this._position = 0, this._schema = null) : (this._started = !0, this._schema = e, this._writeSchema(e))), this;
  }
  write(t) {
    let e = null;
    if (this._sink) {
      if (t == null)
        return this.finish() && void 0;
      if (t instanceof Z && !(e = t.schema))
        return this.finish() && void 0;
      if (t instanceof st && !(e = t.schema))
        return this.finish() && void 0;
    } else throw new Error("RecordBatchWriter is closed");
    if (e && !un(e, this._schema)) {
      if (this._started && this._autoDestroy)
        return this.close();
      this.reset(this._sink, e);
    }
    t instanceof st ? t instanceof Nn || this._writeRecordBatch(t) : t instanceof Z ? this.writeAll(t.batches) : $e(t) && this.writeAll(t);
  }
  _writeMessage(t, e = 8) {
    const n = e - 1, s = tt.encode(t), r = s.byteLength, o = this._writeLegacyIpcFormat ? 4 : 8, a = r + o + n & ~n, c = a - r - o;
    return t.headerType === N.RecordBatch ? this._recordBatchBlocks.push(new Ht(a, t.bodyLength, this._position)) : t.headerType === N.DictionaryBatch && this._dictionaryBlocks.push(new Ht(a, t.bodyLength, this._position)), this._writeLegacyIpcFormat || this._write(Int32Array.of(-1)), this._write(Int32Array.of(a - o)), r > 0 && this._write(s), this._writePadding(c);
  }
  _write(t) {
    if (this._started) {
      const e = O(t);
      e && e.byteLength > 0 && (this._sink.write(e), this._position += e.byteLength);
    }
    return this;
  }
  _writeSchema(t) {
    return this._writeMessage(tt.from(t));
  }
  // @ts-ignore
  _writeFooter(t) {
    return this._writeLegacyIpcFormat ? this._write(Int32Array.of(0)) : this._write(Int32Array.of(-1, 0));
  }
  _writeMagic() {
    return this._write(je);
  }
  _writePadding(t) {
    return t > 0 ? this._write(new Uint8Array(t)) : this;
  }
  _writeRecordBatch(t) {
    const { byteLength: e, nodes: n, bufferRegions: s, buffers: r } = Y.assemble(t), o = new lt(t.numRows, n, s), a = tt.from(o, e);
    return this._writeDictionaries(t)._writeMessage(a)._writeBodyBuffers(r);
  }
  _writeDictionaryBatch(t, e, n = !1) {
    const { byteLength: s, nodes: r, bufferRegions: o, buffers: a } = Y.assemble(new R([t])), c = new lt(t.length, r, o), u = new Nt(c, e, n), d = tt.from(u, s);
    return this._writeMessage(d)._writeBodyBuffers(a);
  }
  _writeBodyBuffers(t) {
    let e, n, s;
    for (let r = -1, o = t.length; ++r < o; )
      (e = t[r]) && (n = e.byteLength) > 0 && (this._write(e), (s = (n + 7 & -8) - n) > 0 && this._writePadding(s));
    return this;
  }
  _writeDictionaries(t) {
    var e, n;
    for (const [s, r] of t.dictionaries) {
      const o = (e = r?.data) !== null && e !== void 0 ? e : [], a = this._seenDictionaries.get(s), c = (n = this._dictionaryDeltaOffsets.get(s)) !== null && n !== void 0 ? n : 0;
      if (!a || a.data[0] !== o[0])
        for (const [u, d] of o.entries())
          this._writeDictionaryBatch(d, s, u > 0);
      else if (c < o.length)
        for (const u of o.slice(c))
          this._writeDictionaryBatch(u, s, !0);
      this._seenDictionaries.set(s, r), this._dictionaryDeltaOffsets.set(s, o.length);
    }
    return this;
  }
}
class Cn extends _o {
  /** @nocollapse */
  static writeAll(t, e) {
    const n = new Cn(e);
    return te(t) ? t.then((s) => n.writeAll(s)) : Be(t) ? xn(n, t) : kn(n, t);
  }
}
class Pn extends _o {
  /** @nocollapse */
  static writeAll(t) {
    const e = new Pn();
    return te(t) ? t.then((n) => e.writeAll(n)) : Be(t) ? xn(e, t) : kn(e, t);
  }
  constructor() {
    super(), this._autoDestroy = !0;
  }
  // @ts-ignore
  _writeSchema(t) {
    return this._writeMagic()._writePadding(2);
  }
  _writeDictionaryBatch(t, e, n = !1) {
    if (!n && this._seenDictionaries.has(e))
      throw new Error("The Arrow File format does not support replacement dictionaries. ");
    return super._writeDictionaryBatch(t, e, n);
  }
  _writeFooter(t) {
    const e = Ve.encode(new Ve(t, G.V5, this._recordBatchBlocks, this._dictionaryBlocks));
    return super._writeFooter(t)._write(e)._write(Int32Array.of(e.byteLength))._writeMagic();
  }
}
function kn(i, t) {
  let e = t;
  t instanceof Z && (e = t.batches, i.reset(void 0, t.schema));
  for (const n of e)
    i.write(n);
  return i.finish();
}
function xn(i, t) {
  return B(this, void 0, void 0, function* () {
    var e, n, s, r, o, a, c;
    try {
      for (e = !0, n = Xt(t); s = yield n.next(), r = s.done, !r; e = !0) {
        c = s.value, e = !1;
        const u = c;
        i.write(u);
      }
    } catch (u) {
      o = { error: u };
    } finally {
      try {
        !e && !r && (a = n.return) && (yield a.call(n));
      } finally {
        if (o) throw o.error;
      }
    }
    return i.finish();
  });
}
function Kc(i, t = "stream") {
  return (t === "stream" ? Cn : Pn).writeAll(i).toUint8Array(!0);
}
var Qc = Object.create, go = Object.defineProperty, Jc = Object.getOwnPropertyDescriptor, Zc = Object.getOwnPropertyNames, Xc = Object.getPrototypeOf, tl = Object.prototype.hasOwnProperty, el = (i, t) => () => (t || i((t = { exports: {} }).exports, t), t.exports), il = (i, t, e, n) => {
  if (t && typeof t == "object" || typeof t == "function") for (let s of Zc(t)) !tl.call(i, s) && s !== e && go(i, s, { get: () => t[s], enumerable: !(n = Jc(t, s)) || n.enumerable });
  return i;
}, nl = (i, t, e) => (e = i != null ? Qc(Xc(i)) : {}, il(!i || !i.__esModule ? go(e, "default", { value: i, enumerable: !0 }) : e, i)), sl = el((i, t) => {
  t.exports = Worker;
}), rl = ((i) => (i[i.UNDEFINED = 0] = "UNDEFINED", i[i.AUTOMATIC = 1] = "AUTOMATIC", i[i.READ_ONLY = 2] = "READ_ONLY", i[i.READ_WRITE = 3] = "READ_WRITE", i))(rl || {}), ol = ((i) => (i[i.IDENTIFIER = 0] = "IDENTIFIER", i[i.NUMERIC_CONSTANT = 1] = "NUMERIC_CONSTANT", i[i.STRING_CONSTANT = 2] = "STRING_CONSTANT", i[i.OPERATOR = 3] = "OPERATOR", i[i.KEYWORD = 4] = "KEYWORD", i[i.COMMENT = 5] = "COMMENT", i))(ol || {}), al = ((i) => (i[i.NONE = 0] = "NONE", i[i.DEBUG = 1] = "DEBUG", i[i.INFO = 2] = "INFO", i[i.WARNING = 3] = "WARNING", i[i.ERROR = 4] = "ERROR", i))(al || {}), cl = ((i) => (i[i.NONE = 0] = "NONE", i[i.CONNECT = 1] = "CONNECT", i[i.DISCONNECT = 2] = "DISCONNECT", i[i.OPEN = 3] = "OPEN", i[i.QUERY = 4] = "QUERY", i[i.INSTANTIATE = 5] = "INSTANTIATE", i))(cl || {}), ll = ((i) => (i[i.NONE = 0] = "NONE", i[i.OK = 1] = "OK", i[i.ERROR = 2] = "ERROR", i[i.START = 3] = "START", i[i.RUN = 4] = "RUN", i[i.CAPTURE = 5] = "CAPTURE", i))(ll || {}), ul = ((i) => (i[i.NONE = 0] = "NONE", i[i.WEB_WORKER = 1] = "WEB_WORKER", i[i.NODE_WORKER = 2] = "NODE_WORKER", i[i.BINDINGS = 3] = "BINDINGS", i[i.ASYNC_DUCKDB = 4] = "ASYNC_DUCKDB", i))(ul || {}), dl = class {
  constructor(i = 2) {
    this.level = i;
  }
  log(i) {
    i.level >= this.level && console.log(i);
  }
}, hl = ((i) => (i[i.SUCCESS = 0] = "SUCCESS", i))(hl || {}), fl = class {
  constructor(i, t) {
    this._bindings = i, this._conn = t;
  }
  get bindings() {
    return this._bindings;
  }
  async close() {
    return this._bindings.disconnect(this._conn);
  }
  useUnsafe(i) {
    return i(this._bindings, this._conn);
  }
  async query(i) {
    this._bindings.logger.log({ timestamp: /* @__PURE__ */ new Date(), level: 2, origin: 4, topic: 4, event: 4, value: i });
    let t = await this._bindings.runQuery(this._conn, i), e = yt.from(t);
    return console.assert(e.isSync(), "Reader is not sync"), console.assert(e.isFile(), "Reader is not file"), new Z(e);
  }
  async send(i) {
    this._bindings.logger.log({ timestamp: /* @__PURE__ */ new Date(), level: 2, origin: 4, topic: 4, event: 4, value: i });
    let t = await this._bindings.startPendingQuery(this._conn, i);
    for (; t == null; ) t = await this._bindings.pollPendingQuery(this._conn);
    let e = new bo(this._bindings, this._conn, t), n = await yt.from(e);
    return console.assert(n.isAsync()), console.assert(n.isStream()), n;
  }
  async cancelSent() {
    return await this._bindings.cancelPendingQuery(this._conn);
  }
  async getTableNames(i) {
    return await this._bindings.getTableNames(this._conn, i);
  }
  async prepare(i) {
    let t = await this._bindings.createPrepared(this._conn, i);
    return new yl(this._bindings, this._conn, t);
  }
  async insertArrowTable(i, t) {
    let e = Kc(i, "stream");
    await this.insertArrowFromIPCStream(e, t);
  }
  async insertArrowFromIPCStream(i, t) {
    await this._bindings.insertArrowFromIPCStream(this._conn, i, t);
  }
  async insertCSVFromPath(i, t) {
    await this._bindings.insertCSVFromPath(this._conn, i, t);
  }
  async insertJSONFromPath(i, t) {
    await this._bindings.insertJSONFromPath(this._conn, i, t);
  }
}, bo = class {
  constructor(i, t, e) {
    this.db = i, this.conn = t, this.header = e, this._first = !0, this._depleted = !1, this._inFlight = null;
  }
  async next() {
    if (this._first) return this._first = !1, { done: !1, value: this.header };
    if (this._depleted) return { done: !0, value: null };
    let i;
    return this._inFlight != null ? (i = await this._inFlight, this._inFlight = null) : i = await this.db.fetchQueryResults(this.conn), this._depleted = i.length == 0, this._depleted || (this._inFlight = this.db.fetchQueryResults(this.conn)), { done: this._depleted, value: i };
  }
  [Symbol.asyncIterator]() {
    return this;
  }
}, yl = class {
  constructor(i, t, e) {
    this.bindings = i, this.connectionId = t, this.statementId = e;
  }
  async close() {
    await this.bindings.closePrepared(this.connectionId, this.statementId);
  }
  async query(...i) {
    let t = await this.bindings.runPrepared(this.connectionId, this.statementId, i), e = yt.from(t);
    return console.assert(e.isSync()), console.assert(e.isFile()), new Z(e);
  }
  async send(...i) {
    let t = await this.bindings.sendPrepared(this.connectionId, this.statementId, i), e = new bo(this.bindings, this.connectionId, t), n = await yt.from(e);
    return console.assert(n.isAsync()), console.assert(n.isStream()), n;
  }
}, pl = ((i) => (i.CANCEL_PENDING_QUERY = "CANCEL_PENDING_QUERY", i.CLOSE_PREPARED = "CLOSE_PREPARED", i.COLLECT_FILE_STATISTICS = "COLLECT_FILE_STATISTICS", i.CONNECT = "CONNECT", i.COPY_FILE_TO_BUFFER = "COPY_FILE_TO_BUFFER", i.COPY_FILE_TO_PATH = "COPY_FILE_TO_PATH", i.CREATE_PREPARED = "CREATE_PREPARED", i.DISCONNECT = "DISCONNECT", i.DROP_FILE = "DROP_FILE", i.DROP_FILES = "DROP_FILES", i.EXPORT_FILE_STATISTICS = "EXPORT_FILE_STATISTICS", i.FETCH_QUERY_RESULTS = "FETCH_QUERY_RESULTS", i.FLUSH_FILES = "FLUSH_FILES", i.GET_FEATURE_FLAGS = "GET_FEATURE_FLAGS", i.GET_TABLE_NAMES = "GET_TABLE_NAMES", i.GET_VERSION = "GET_VERSION", i.GLOB_FILE_INFOS = "GLOB_FILE_INFOS", i.INSERT_ARROW_FROM_IPC_STREAM = "INSERT_ARROW_FROM_IPC_STREAM", i.INSERT_CSV_FROM_PATH = "IMPORT_CSV_FROM_PATH", i.INSERT_JSON_FROM_PATH = "IMPORT_JSON_FROM_PATH", i.INSTANTIATE = "INSTANTIATE", i.OPEN = "OPEN", i.PING = "PING", i.POLL_PENDING_QUERY = "POLL_PENDING_QUERY", i.REGISTER_FILE_BUFFER = "REGISTER_FILE_BUFFER", i.REGISTER_FILE_HANDLE = "REGISTER_FILE_HANDLE", i.REGISTER_FILE_URL = "REGISTER_FILE_URL", i.RESET = "RESET", i.RUN_PREPARED = "RUN_PREPARED", i.RUN_QUERY = "RUN_QUERY", i.SEND_PREPARED = "SEND_PREPARED", i.START_PENDING_QUERY = "START_PENDING_QUERY", i.TOKENIZE = "TOKENIZE", i))(pl || {}), ml = ((i) => (i.CONNECTION_INFO = "CONNECTION_INFO", i.ERROR = "ERROR", i.FEATURE_FLAGS = "FEATURE_FLAGS", i.FILE_BUFFER = "FILE_BUFFER", i.FILE_INFOS = "FILE_INFOS", i.FILE_SIZE = "FILE_SIZE", i.FILE_STATISTICS = "FILE_STATISTICS", i.INSTANTIATE_PROGRESS = "INSTANTIATE_PROGRESS", i.LOG = "LOG", i.OK = "OK", i.PREPARED_STATEMENT_ID = "PREPARED_STATEMENT_ID", i.QUERY_PLAN = "QUERY_PLAN", i.QUERY_RESULT = "QUERY_RESULT", i.QUERY_RESULT_CHUNK = "QUERY_RESULT_CHUNK", i.QUERY_RESULT_HEADER = "QUERY_RESULT_HEADER", i.QUERY_RESULT_HEADER_OR_NULL = "QUERY_RESULT_HEADER_OR_NULL", i.REGISTERED_FILE = "REGISTERED_FILE", i.SCRIPT_TOKENS = "SCRIPT_TOKENS", i.SUCCESS = "SUCCESS", i.TABLE_NAMES = "TABLE_NAMES", i.VERSION_STRING = "VERSION_STRING", i))(ml || {}), E = class {
  constructor(i, t) {
    this.promiseResolver = () => {
    }, this.promiseRejecter = () => {
    }, this.type = i, this.data = t, this.promise = new Promise((e, n) => {
      this.promiseResolver = e, this.promiseRejecter = n;
    });
  }
};
function ai(i) {
  switch (i.typeId) {
    case l.Binary:
      return { sqlType: "binary" };
    case l.Bool:
      return { sqlType: "bool" };
    case l.Date:
      return { sqlType: "date" };
    case l.DateDay:
      return { sqlType: "date32[d]" };
    case l.DateMillisecond:
      return { sqlType: "date64[ms]" };
    case l.Decimal: {
      let t = i;
      return { sqlType: "decimal", precision: t.precision, scale: t.scale };
    }
    case l.Float:
      return { sqlType: "float" };
    case l.Float16:
      return { sqlType: "float16" };
    case l.Float32:
      return { sqlType: "float32" };
    case l.Float64:
      return { sqlType: "float64" };
    case l.Int:
      return { sqlType: "int32" };
    case l.Int16:
      return { sqlType: "int16" };
    case l.Int32:
      return { sqlType: "int32" };
    case l.Int64:
      return { sqlType: "int64" };
    case l.Uint16:
      return { sqlType: "uint16" };
    case l.Uint32:
      return { sqlType: "uint32" };
    case l.Uint64:
      return { sqlType: "uint64" };
    case l.Uint8:
      return { sqlType: "uint8" };
    case l.IntervalDayTime:
      return { sqlType: "interval[dt]" };
    case l.IntervalYearMonth:
      return { sqlType: "interval[m]" };
    case l.List:
      return { sqlType: "list", valueType: ai(i.valueType) };
    case l.FixedSizeBinary:
      return { sqlType: "fixedsizebinary", byteWidth: i.byteWidth };
    case l.Null:
      return { sqlType: "null" };
    case l.Utf8:
      return { sqlType: "utf8" };
    case l.Struct:
      return { sqlType: "struct", fields: i.children.map((t) => fn(t.name, t.type)) };
    case l.Map: {
      let t = i;
      return { sqlType: "map", keyType: ai(t.keyType), valueType: ai(t.valueType) };
    }
    case l.Time:
      return { sqlType: "time[s]" };
    case l.TimeMicrosecond:
      return { sqlType: "time[us]" };
    case l.TimeMillisecond:
      return { sqlType: "time[ms]" };
    case l.TimeNanosecond:
      return { sqlType: "time[ns]" };
    case l.TimeSecond:
      return { sqlType: "time[s]" };
    case l.Timestamp:
      return { sqlType: "timestamp", timezone: i.timezone || void 0 };
    case l.TimestampSecond:
      return { sqlType: "timestamp[s]", timezone: i.timezone || void 0 };
    case l.TimestampMicrosecond:
      return { sqlType: "timestamp[us]", timezone: i.timezone || void 0 };
    case l.TimestampNanosecond:
      return { sqlType: "timestamp[ns]", timezone: i.timezone || void 0 };
    case l.TimestampMillisecond:
      return { sqlType: "timestamp[ms]", timezone: i.timezone || void 0 };
  }
  throw new Error("unsupported arrow type: ".concat(i.toString()));
}
function fn(i, t) {
  let e = ai(t);
  return e.name = i, e;
}
var _l = new TextEncoder(), gl = class {
  constructor(i, t = null) {
    this._onInstantiationProgress = [], this._worker = null, this._workerShutdownPromise = null, this._workerShutdownResolver = () => {
    }, this._nextMessageId = 0, this._pendingRequests = /* @__PURE__ */ new Map(), this._logger = i, this._onMessageHandler = this.onMessage.bind(this), this._onErrorHandler = this.onError.bind(this), this._onCloseHandler = this.onClose.bind(this), t != null && this.attach(t);
  }
  get logger() {
    return this._logger;
  }
  attach(i) {
    this._worker = i, this._worker.addEventListener("message", this._onMessageHandler), this._worker.addEventListener("error", this._onErrorHandler), this._worker.addEventListener("close", this._onCloseHandler), this._workerShutdownPromise = new Promise((t, e) => {
      this._workerShutdownResolver = t;
    });
  }
  detach() {
    this._worker && (this._worker.removeEventListener("message", this._onMessageHandler), this._worker.removeEventListener("error", this._onErrorHandler), this._worker.removeEventListener("close", this._onCloseHandler), this._worker = null, this._workerShutdownResolver(null), this._workerShutdownPromise = null, this._workerShutdownResolver = () => {
    });
  }
  async terminate() {
    this._worker && (this._worker.terminate(), this._worker = null, this._workerShutdownPromise = null, this._workerShutdownResolver = () => {
    });
  }
  async postTask(i, t = []) {
    if (!this._worker) {
      console.error("cannot send a message since the worker is not set!");
      return;
    }
    let e = this._nextMessageId++;
    return this._pendingRequests.set(e, i), this._worker.postMessage({ messageId: e, type: i.type, data: i.data }, t), await i.promise;
  }
  onMessage(i) {
    var t;
    let e = i.data;
    switch (e.type) {
      case "LOG": {
        this._logger.log(e.data);
        return;
      }
      case "INSTANTIATE_PROGRESS": {
        for (let s of this._onInstantiationProgress) s(e.data);
        return;
      }
    }
    let n = this._pendingRequests.get(e.requestId);
    if (!n) {
      console.warn("unassociated response: [".concat(e.requestId, ", ").concat(e.type.toString(), "]"));
      return;
    }
    if (this._pendingRequests.delete(e.requestId), e.type == "ERROR") {
      let s = new Error(e.data.message);
      s.name = e.data.name, (t = Object.getOwnPropertyDescriptor(s, "stack")) != null && t.writable && (s.stack = e.data.stack), n.promiseRejecter(s);
      return;
    }
    switch (n.type) {
      case "CLOSE_PREPARED":
      case "COLLECT_FILE_STATISTICS":
      case "COPY_FILE_TO_PATH":
      case "DISCONNECT":
      case "DROP_FILE":
      case "DROP_FILES":
      case "FLUSH_FILES":
      case "INSERT_ARROW_FROM_IPC_STREAM":
      case "IMPORT_CSV_FROM_PATH":
      case "IMPORT_JSON_FROM_PATH":
      case "OPEN":
      case "PING":
      case "REGISTER_FILE_BUFFER":
      case "REGISTER_FILE_HANDLE":
      case "REGISTER_FILE_URL":
      case "RESET":
        if (e.type == "OK") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "INSTANTIATE":
        if (this._onInstantiationProgress = [], e.type == "OK") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "GLOB_FILE_INFOS":
        if (e.type == "FILE_INFOS") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "GET_VERSION":
        if (e.type == "VERSION_STRING") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "GET_FEATURE_FLAGS":
        if (e.type == "FEATURE_FLAGS") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "GET_TABLE_NAMES":
        if (e.type == "TABLE_NAMES") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "TOKENIZE":
        if (e.type == "SCRIPT_TOKENS") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "COPY_FILE_TO_BUFFER":
        if (e.type == "FILE_BUFFER") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "EXPORT_FILE_STATISTICS":
        if (e.type == "FILE_STATISTICS") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "CONNECT":
        if (e.type == "CONNECTION_INFO") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "RUN_PREPARED":
      case "RUN_QUERY":
        if (e.type == "QUERY_RESULT") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "SEND_PREPARED":
        if (e.type == "QUERY_RESULT_HEADER") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "START_PENDING_QUERY":
        if (e.type == "QUERY_RESULT_HEADER_OR_NULL") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "POLL_PENDING_QUERY":
        if (e.type == "QUERY_RESULT_HEADER_OR_NULL") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "CANCEL_PENDING_QUERY":
        if (this._onInstantiationProgress = [], e.type == "SUCCESS") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "FETCH_QUERY_RESULTS":
        if (e.type == "QUERY_RESULT_CHUNK") {
          n.promiseResolver(e.data);
          return;
        }
        break;
      case "CREATE_PREPARED":
        if (e.type == "PREPARED_STATEMENT_ID") {
          n.promiseResolver(e.data);
          return;
        }
        break;
    }
    n.promiseRejecter(new Error("unexpected response type: ".concat(e.type.toString())));
  }
  onError(i) {
    console.error(i), console.error("error in duckdb worker: ".concat(i.message)), this._pendingRequests.clear();
  }
  onClose() {
    if (this._workerShutdownResolver(null), this._pendingRequests.size != 0) {
      console.warn("worker terminated with ".concat(this._pendingRequests.size, " pending requests"));
      return;
    }
    this._pendingRequests.clear();
  }
  async reset() {
    let i = new E("RESET", null);
    return await this.postTask(i);
  }
  async ping() {
    let i = new E("PING", null);
    await this.postTask(i);
  }
  async dropFile(i) {
    let t = new E("DROP_FILE", i);
    return await this.postTask(t);
  }
  async dropFiles() {
    let i = new E("DROP_FILES", null);
    return await this.postTask(i);
  }
  async flushFiles() {
    let i = new E("FLUSH_FILES", null);
    return await this.postTask(i);
  }
  async instantiate(i, t = null, e = (n) => {
  }) {
    this._onInstantiationProgress.push(e);
    let n = new E("INSTANTIATE", [i, t]);
    return await this.postTask(n);
  }
  async getVersion() {
    let i = new E("GET_VERSION", null);
    return await this.postTask(i);
  }
  async getFeatureFlags() {
    let i = new E("GET_FEATURE_FLAGS", null);
    return await this.postTask(i);
  }
  async open(i) {
    let t = new E("OPEN", i);
    await this.postTask(t);
  }
  async tokenize(i) {
    let t = new E("TOKENIZE", i);
    return await this.postTask(t);
  }
  async connectInternal() {
    let i = new E("CONNECT", null);
    return await this.postTask(i);
  }
  async connect() {
    let i = await this.connectInternal();
    return new fl(this, i);
  }
  async disconnect(i) {
    let t = new E("DISCONNECT", i);
    await this.postTask(t);
  }
  async runQuery(i, t) {
    let e = new E("RUN_QUERY", [i, t]);
    return await this.postTask(e);
  }
  async startPendingQuery(i, t) {
    let e = new E("START_PENDING_QUERY", [i, t]);
    return await this.postTask(e);
  }
  async pollPendingQuery(i) {
    let t = new E("POLL_PENDING_QUERY", i);
    return await this.postTask(t);
  }
  async cancelPendingQuery(i) {
    let t = new E("CANCEL_PENDING_QUERY", i);
    return await this.postTask(t);
  }
  async fetchQueryResults(i) {
    let t = new E("FETCH_QUERY_RESULTS", i);
    return await this.postTask(t);
  }
  async getTableNames(i, t) {
    let e = new E("GET_TABLE_NAMES", [i, t]);
    return await this.postTask(e);
  }
  async createPrepared(i, t) {
    let e = new E("CREATE_PREPARED", [i, t]);
    return await this.postTask(e);
  }
  async closePrepared(i, t) {
    let e = new E("CLOSE_PREPARED", [i, t]);
    await this.postTask(e);
  }
  async runPrepared(i, t, e) {
    let n = new E("RUN_PREPARED", [i, t, e]);
    return await this.postTask(n);
  }
  async sendPrepared(i, t, e) {
    let n = new E("SEND_PREPARED", [i, t, e]);
    return await this.postTask(n);
  }
  async globFiles(i) {
    let t = new E("GLOB_FILE_INFOS", i);
    return await this.postTask(t);
  }
  async registerFileText(i, t) {
    let e = _l.encode(t);
    await this.registerFileBuffer(i, e);
  }
  async registerFileURL(i, t, e, n) {
    t === void 0 && (t = i);
    let s = new E("REGISTER_FILE_URL", [i, t, e, n]);
    await this.postTask(s);
  }
  async registerEmptyFileBuffer(i) {
  }
  async registerFileBuffer(i, t) {
    let e = new E("REGISTER_FILE_BUFFER", [i, t]);
    await this.postTask(e, [t.buffer]);
  }
  async registerFileHandle(i, t, e, n) {
    let s = new E("REGISTER_FILE_HANDLE", [i, t, e, n]);
    await this.postTask(s, []);
  }
  async collectFileStatistics(i, t) {
    let e = new E("COLLECT_FILE_STATISTICS", [i, t]);
    await this.postTask(e, []);
  }
  async exportFileStatistics(i) {
    let t = new E("EXPORT_FILE_STATISTICS", i);
    return await this.postTask(t, []);
  }
  async copyFileToBuffer(i) {
    let t = new E("COPY_FILE_TO_BUFFER", i);
    return await this.postTask(t);
  }
  async copyFileToPath(i, t) {
    let e = new E("COPY_FILE_TO_PATH", [i, t]);
    await this.postTask(e);
  }
  async insertArrowFromIPCStream(i, t, e) {
    if (t.length == 0) return;
    let n = new E("INSERT_ARROW_FROM_IPC_STREAM", [i, t, e]);
    await this.postTask(n, [t.buffer]);
  }
  async insertCSVFromPath(i, t, e) {
    if (e.columns !== void 0) {
      let s = [];
      for (let r in e.columns) {
        let o = e.columns[r];
        s.push(fn(r, o));
      }
      e.columnsFlat = s, delete e.columns;
    }
    let n = new E("IMPORT_CSV_FROM_PATH", [i, t, e]);
    await this.postTask(n);
  }
  async insertJSONFromPath(i, t, e) {
    if (e.columns !== void 0) {
      let s = [];
      for (let r in e.columns) {
        let o = e.columns[r];
        s.push(fn(r, o));
      }
      e.columnsFlat = s, delete e.columns;
    }
    let n = new E("IMPORT_JSON_FROM_PATH", [i, t, e]);
    await this.postTask(n);
  }
}, bl = { version: "1.29.0" }, zn = bl.version.split(".");
zn[0];
zn[1];
zn[2];
nl(sl());
function wl() {
  let i = new TextDecoder();
  return (t) => (typeof SharedArrayBuffer < "u" && t.buffer instanceof SharedArrayBuffer && (t = new Uint8Array(t)), i.decode(t));
}
wl();
var vl = ((i) => (i[i.BUFFER = 0] = "BUFFER", i[i.NODE_FS = 1] = "NODE_FS", i[i.BROWSER_FILEREADER = 2] = "BROWSER_FILEREADER", i[i.BROWSER_FSACCESS = 3] = "BROWSER_FSACCESS", i[i.HTTP = 4] = "HTTP", i[i.S3 = 5] = "S3", i))(vl || {});
const j = {
  config: null,
  duckDbPromise: null,
  registeredFiles: /* @__PURE__ */ new Set()
};
function Il(i) {
  return i ? i.endsWith("/") ? i.slice(0, -1) : i : "/duckdb";
}
function wo(i) {
  if (!i)
    throw new Error("DuckDB configuration is required.");
  if (j.config)
    return j.config;
  const t = Il(i.bundleBasePath ?? i.BundleBasePath ?? "/duckdb"), e = i.moduleLoader ?? i.ModuleLoader ?? "duckdb-browser-bundle.js", n = i.mainModule ?? i.MainModule ?? "duckdb-eh.wasm", s = i.pthreadWorker ?? i.PthreadWorker ?? "duckdb-browser-coi.pthread.worker.js", r = i.mainWorker ?? i.MainWorker ?? "duckdb-browser-eh.worker.js";
  return j.config = {
    bundleBasePath: t,
    moduleLoader: e,
    mainModule: n,
    pthreadWorker: s || null,
    mainWorker: r
  }, j.config;
}
function Qi(i, t) {
  return `${i}/${t}`;
}
async function vo() {
  if (!j.config)
    throw new Error("Call initialize before using DuckDB.");
  return j.duckDbPromise || (j.duckDbPromise = (async () => {
    const i = Qi(j.config.bundleBasePath, j.config.mainWorker), t = new Worker(i, { type: "module" }), e = new dl(), n = new gl(e, t), s = Qi(j.config.bundleBasePath, j.config.mainModule), r = j.config.pthreadWorker ? Qi(j.config.bundleBasePath, j.config.pthreadWorker) : void 0;
    return await n.instantiate(s, r), { db: n, worker: t };
  })()), j.duckDbPromise;
}
function Sl(i) {
  return `parquet/${i}`;
}
async function Bl(i, t) {
  if (!Array.isArray(t) || t.length === 0)
    return [];
  const e = /* @__PURE__ */ new Set(), n = [];
  for (const r of t) {
    if (typeof r != "string")
      continue;
    const o = r.trim();
    o.length === 0 || e.has(o) || (e.add(o), n.push(o));
  }
  if (n.length === 0)
    return [];
  const s = [];
  for (const r of n) {
    const o = Sl(r);
    if (!j.registeredFiles.has(o)) {
      const a = await fetch(`api/parquet/file?key=${encodeURIComponent(r)}`);
      if (!a.ok)
        throw new Error(`Failed to download parquet file (${a.status})`);
      const c = new Uint8Array(await a.arrayBuffer());
      await i.registerFileBuffer(o, c), j.registeredFiles.add(o);
    }
    s.push(o);
  }
  return s;
}
function Al(i) {
  return i.replace(/'/g, "''");
}
function Tl(i) {
  return `ARRAY[${i.map((e) => `'${Al(e)}'`).join(", ")}]`;
}
function Ji(i) {
  return i.replace(/\\/g, "\\\\").replace(/'/g, "''");
}
function Dl(i) {
  const t = i.trim();
  return /[%_]/.test(t) ? t : `%${t}%`;
}
function Fl(i) {
  return i == null ? null : typeof i == "bigint" ? Number(i) : Array.isArray(i) || typeof i == "object" && i !== null ? JSON.stringify(i) : i;
}
function Ol(i, t) {
  const e = {};
  for (const n of t)
    e[n] = Fl(i[n]);
  return e;
}
function Zi(i, t, e) {
  const n = i?.[t] ?? i?.[e];
  return typeof n == "string" && n.trim().length > 0 ? n.trim() : null;
}
function El(i, t, e) {
  const n = i?.[t] ?? i?.[e];
  if (typeof n == "number" && Number.isFinite(n))
    return n;
  if (typeof n == "string" && n.length > 0) {
    const s = Number.parseInt(n, 10);
    return Number.isFinite(s) ? s : null;
  }
  return null;
}
function Nl(i) {
  const t = i?.FileKeys ?? i?.fileKeys;
  return Array.isArray(t) ? t : [];
}
async function Ll(i) {
  wo(i), await vo();
}
async function Ul(i) {
  if (!i)
    throw new Error("A query request is required.");
  wo(j.config ?? {});
  const t = await vo(), e = Nl(i);
  if (e.length === 0)
    return [];
  const n = await Bl(t.db, e);
  if (n.length === 0)
    return [];
  const s = i?.SelectColumns ?? i?.selectColumns ?? "*", r = [], o = Zi(i, "Email", "email");
  if (o) {
    const K = Dl(o);
    r.push(`email ILIKE '${Ji(K)}' ESCAPE '\\'`);
  }
  const a = Zi(i, "EventType", "eventType");
  a && r.push(`event = '${Ji(a)}'`);
  const c = Zi(i, "SgTemplateId", "sgTemplateId");
  c && r.push(`sg_template_id = '${Ji(c)}'`);
  const u = El(i, "Limit", "limit"), d = u && u > 0 ? ` LIMIT ${Math.min(u, 5e3)}` : "", h = r.length > 0 ? ` WHERE ${r.join(" AND ")}` : "", V = Tl(n), F = `SELECT ${s} FROM read_parquet(${V}, union_by_name=true)${h} ORDER BY Timestamp DESC${d}`, W = await t.db.connect();
  try {
    const K = await W.query(F), Te = Array.isArray(K?.schema?.fields) ? K.schema.fields.map((Vt) => Vt?.name).filter((Vt) => typeof Vt == "string" && Vt.length > 0) : [], wt = K.toArray().map((Vt) => Ol(Vt, Te));
    return typeof K.close == "function" ? K.close() : typeof K.release == "function" && K.release(), wt;
  } finally {
    await W.close();
  }
}
async function Ml() {
  if (j.duckDbPromise)
    try {
      const i = await j.duckDbPromise;
      await i.db.terminate(), i.worker.terminate();
    } finally {
      j.duckDbPromise = null, j.registeredFiles.clear();
    }
}
function Cl() {
  return j;
}
export {
  Cl as __getInternalState,
  Ml as dispose,
  Ll as initialize,
  Ul as queryEvents
};
//# sourceMappingURL=duckdb-browser-bundle.js.map
