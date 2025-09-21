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
function zn(i) {
  var t = typeof Symbol == "function" && Symbol.iterator, e = t && i[t], n = 0;
  if (e) return e.call(i);
  if (i && typeof i.length == "number") return {
    next: function() {
      return i && n >= i.length && (i = void 0), { value: i && i[n++], done: !i };
    }
  };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function T(i) {
  return this instanceof T ? (this.v = i, this) : new T(i);
}
function At(i, t, e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var n = e.apply(i, t || []), s, r = [];
  return s = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), a("next"), a("throw"), a("return", o), s[Symbol.asyncIterator] = function() {
    return this;
  }, s;
  function o(F) {
    return function(k) {
      return Promise.resolve(k).then(F, h);
    };
  }
  function a(F, k) {
    n[F] && (s[F] = function(zt) {
      return new Promise(function(Te, Q) {
        r.push([F, zt, Te, Q]) > 1 || c(F, zt);
      });
    }, k && (s[F] = k(s[F])));
  }
  function c(F, k) {
    try {
      u(n[F](k));
    } catch (zt) {
      j(r[0][3], zt);
    }
  }
  function u(F) {
    F.value instanceof T ? Promise.resolve(F.value.v).then(d, h) : j(r[0][2], F);
  }
  function d(F) {
    c("next", F);
  }
  function h(F) {
    c("throw", F);
  }
  function j(F, k) {
    F(k), r.shift(), r.length && c(r[0][0], r[0][1]);
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
      return (e = !e) ? { value: T(i[s](o)), done: !1 } : r ? r(o) : o;
    } : r;
  }
}
function Zt(i) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = i[Symbol.asyncIterator], e;
  return t ? t.call(i) : (i = typeof zn == "function" ? zn(i) : i[Symbol.iterator](), e = {}, n("next"), n("throw"), n("return"), e[Symbol.asyncIterator] = function() {
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
const Io = new TextDecoder("utf-8"), Zi = (i) => Io.decode(i), So = new TextEncoder(), fn = (i) => So.encode(i), Bo = (i) => typeof i == "number", ys = (i) => typeof i == "boolean", H = (i) => typeof i == "function", rt = (i) => i != null && Object(i) === i, Xt = (i) => rt(i) && H(i.then), je = (i) => rt(i) && H(i[Symbol.iterator]), Se = (i) => rt(i) && H(i[Symbol.asyncIterator]), Xi = (i) => rt(i) && rt(i.schema), ps = (i) => rt(i) && "done" in i && "value" in i, ms = (i) => rt(i) && H(i.stat) && Bo(i.fd), _s = (i) => rt(i) && yn(i.body), ki = (i) => "_getDOMStream" in i && "_getNodeStream" in i, To = (i) => rt(i) && H(i.abort) && H(i.getWriter) && !ki(i), yn = (i) => rt(i) && H(i.cancel) && H(i.getReader) && !ki(i), Ao = (i) => rt(i) && H(i.end) && H(i.write) && ys(i.writable) && !ki(i), gs = (i) => rt(i) && H(i.read) && H(i.pipe) && ys(i.readable) && !ki(i), Do = (i) => rt(i) && H(i.clear) && H(i.bytes) && H(i.position) && H(i.setPosition) && H(i.capacity) && H(i.getBufferIdentifier) && H(i.createLong), pn = typeof SharedArrayBuffer < "u" ? SharedArrayBuffer : ArrayBuffer;
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
function Vn(i, t, e = 0, n = t.byteLength) {
  const s = i.byteLength, r = new Uint8Array(i.buffer, i.byteOffset, s), o = new Uint8Array(t.buffer, t.byteOffset, Math.min(n, s));
  return r.set(o, e), i;
}
function Ft(i, t) {
  const e = Fo(i), n = e.reduce((d, h) => d + h.byteLength, 0);
  let s, r, o, a = 0, c = -1;
  const u = Math.min(t || Number.POSITIVE_INFINITY, n);
  for (const d = e.length; ++c < d; ) {
    if (s = e[c], r = s.subarray(0, Math.min(s.length, u - a)), u <= a + r.length) {
      r.length < s.length ? e[c] = s.subarray(r.length) : r.length === s.length && c++, o ? Vn(o, r, a) : o = r;
      break;
    }
    Vn(o || (o = new Uint8Array(u)), r, a), a += r.length;
  }
  return [o || new Uint8Array(0), e.slice(c), n - (o ? o.byteLength : 0)];
}
function P(i, t) {
  let e = ps(t) ? t.value : t;
  return e instanceof i ? i === Uint8Array ? new i(e.buffer, e.byteOffset, e.byteLength) : e : e ? (typeof e == "string" && (e = fn(e)), e instanceof ArrayBuffer ? new i(e) : e instanceof pn ? new i(e) : Do(e) ? P(i, e.bytes()) : ArrayBuffer.isView(e) ? e.byteLength <= 0 ? new i(0) : new i(e.buffer, e.byteOffset, e.byteLength / i.BYTES_PER_ELEMENT) : i.from(e)) : new i(0);
}
const Ae = (i) => P(Int32Array, i), jn = (i) => P(BigInt64Array, i), O = (i) => P(Uint8Array, i), tn = (i) => (i.next(), i);
function* Oo(i, t) {
  const e = function* (s) {
    yield s;
  }, n = typeof t == "string" || ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof pn ? e(t) : je(t) ? t : e(t);
  return yield* tn((function* (s) {
    let r = null;
    do
      r = s.next(yield P(i, r));
    while (!r.done);
  })(n[Symbol.iterator]())), new i();
}
const Eo = (i) => Oo(Uint8Array, i);
function bs(i, t) {
  return At(this, arguments, function* () {
    if (Xt(t))
      return yield T(yield T(yield* Je(Zt(bs(i, yield T(t))))));
    const n = function(o) {
      return At(this, arguments, function* () {
        yield yield T(yield T(o));
      });
    }, s = function(o) {
      return At(this, arguments, function* () {
        yield T(yield* Je(Zt(tn((function* (a) {
          let c = null;
          do
            c = a.next(yield c?.value);
          while (!c.done);
        })(o[Symbol.iterator]())))));
      });
    }, r = typeof t == "string" || ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof pn ? n(t) : je(t) ? s(t) : Se(t) ? t : n(t);
    return yield T(
      // otherwise if AsyncIterable, use it
      yield* Je(Zt(tn((function(o) {
        return At(this, arguments, function* () {
          let a = null;
          do
            a = yield T(o.next(yield yield T(P(i, a))));
          while (!a.done);
        });
      })(r[Symbol.asyncIterator]()))))
    ), yield T(new i());
  });
}
const No = (i) => bs(Uint8Array, i);
function ws(i, t, e) {
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
    return He(Lo(i));
  },
  fromAsyncIterable(i) {
    return He(Uo(i));
  },
  fromDOMStream(i) {
    return He(Mo(i));
  },
  fromNodeStream(i) {
    return He(Po(i));
  },
  // @ts-ignore
  toDOMStream(i, t) {
    throw new Error('"toDOMStream" not available in this environment');
  },
  // @ts-ignore
  toNodeStream(i, t) {
    throw new Error('"toNodeStream" not available in this environment');
  }
}, He = (i) => (i.next(), i);
function* Lo(i) {
  let t, e = !1, n = [], s, r, o, a = 0;
  function c() {
    return r === "peek" ? Ft(n, o)[0] : ([s, n, a] = Ft(n, o), s);
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
  return At(this, arguments, function* () {
    let e, n = !1, s = [], r, o, a, c = 0;
    function u() {
      return o === "peek" ? Ft(s, a)[0] : ([r, s, c] = Ft(s, a), r);
    }
    ({ cmd: o, size: a } = (yield yield T(null)) || { cmd: "read", size: 0 });
    const d = No(i)[Symbol.asyncIterator]();
    try {
      do
        if ({ done: e, value: r } = Number.isNaN(a - c) ? yield T(d.next()) : yield T(d.next(a - c)), !e && r.byteLength > 0 && (s.push(r), c += r.byteLength), e || a <= c)
          do
            ({ cmd: o, size: a } = yield yield T(u()));
          while (a < c);
      while (!e);
    } catch (h) {
      (n = !0) && typeof d.throw == "function" && (yield T(d.throw(h)));
    } finally {
      n === !1 && typeof d.return == "function" && (yield T(d.return(new Uint8Array(0))));
    }
    return yield T(null);
  });
}
function Mo(i) {
  return At(this, arguments, function* () {
    let e = !1, n = !1, s = [], r, o, a, c = 0;
    function u() {
      return o === "peek" ? Ft(s, a)[0] : ([r, s, c] = Ft(s, a), r);
    }
    ({ cmd: o, size: a } = (yield yield T(null)) || { cmd: "read", size: 0 });
    const d = new Co(i);
    try {
      do
        if ({ done: e, value: r } = Number.isNaN(a - c) ? yield T(d.read()) : yield T(d.read(a - c)), !e && r.byteLength > 0 && (s.push(O(r)), c += r.byteLength), e || a <= c)
          do
            ({ cmd: o, size: a } = yield yield T(u()));
          while (a < c);
      while (!e);
    } catch (h) {
      (n = !0) && (yield T(d.cancel(h)));
    } finally {
      n === !1 ? yield T(d.cancel()) : i.locked && d.releaseLock();
    }
    return yield T(null);
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
const $i = (i, t) => {
  const e = (s) => n([t, s]);
  let n;
  return [t, e, new Promise((s) => (n = s) && i.once(t, e))];
};
function Po(i) {
  return At(this, arguments, function* () {
    const e = [];
    let n = "error", s = !1, r = null, o, a, c = 0, u = [], d;
    function h() {
      return o === "peek" ? Ft(u, a)[0] : ([d, u, c] = Ft(u, a), d);
    }
    if ({ cmd: o, size: a } = (yield yield T(null)) || { cmd: "read", size: 0 }, i.isTTY)
      return yield yield T(new Uint8Array(0)), yield T(null);
    try {
      e[0] = $i(i, "end"), e[1] = $i(i, "error");
      do {
        if (e[2] = $i(i, "readable"), [n, r] = yield T(Promise.race(e.map((F) => F[2]))), n === "error")
          break;
        if ((s = n === "end") || (Number.isFinite(a - c) ? (d = O(i.read(a - c)), d.byteLength < a - c && (d = O(i.read()))) : d = O(i.read()), d.byteLength > 0 && (u.push(d), c += d.byteLength)), s || a <= c)
          do
            ({ cmd: o, size: a } = yield yield T(h()));
          while (a < c);
      } while (!s);
    } finally {
      yield T(j(e, n === "error" ? r : null));
    }
    return yield T(null);
    function j(F, k) {
      return d = u = null, new Promise((zt, Te) => {
        for (const [Q, vo] of F)
          i.off(Q, vo);
        try {
          const Q = i.destroy;
          Q && Q.call(i, k), k = void 0;
        } catch (Q) {
          k = Q || k;
        } finally {
          k != null ? Te(k) : zt();
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
var K;
(function(i) {
  i[i.HALF = 0] = "HALF", i[i.SINGLE = 1] = "SINGLE", i[i.DOUBLE = 2] = "DOUBLE";
})(K || (K = {}));
var pt;
(function(i) {
  i[i.DAY = 0] = "DAY", i[i.MILLISECOND = 1] = "MILLISECOND";
})(pt || (pt = {}));
var g;
(function(i) {
  i[i.SECOND = 0] = "SECOND", i[i.MILLISECOND = 1] = "MILLISECOND", i[i.MICROSECOND = 2] = "MICROSECOND", i[i.NANOSECOND = 3] = "NANOSECOND";
})(g || (g = {}));
var Ot;
(function(i) {
  i[i.YEAR_MONTH = 0] = "YEAR_MONTH", i[i.DAY_TIME = 1] = "DAY_TIME", i[i.MONTH_DAY_NANO = 2] = "MONTH_DAY_NANO";
})(Ot || (Ot = {}));
const Yi = 2, St = 4, Mt = 4, U = 4, $t = new Int32Array(2), $n = new Float32Array($t.buffer), Yn = new Float64Array($t.buffer), qe = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;
var en;
(function(i) {
  i[i.UTF8_BYTES = 1] = "UTF8_BYTES", i[i.UTF16_STRING = 2] = "UTF16_STRING";
})(en || (en = {}));
let ge = class vs {
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
    return new vs(new Uint8Array(t));
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
    return $t[0] = this.readInt32(t), $n[0];
  }
  readFloat64(t) {
    return $t[qe ? 0 : 1] = this.readInt32(t), $t[qe ? 1 : 0] = this.readInt32(t + 4), Yn[0];
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
    $n[0] = e, this.writeInt32(t, $t[0]);
  }
  writeFloat64(t, e) {
    Yn[0] = e, this.writeInt32(t, $t[qe ? 0 : 1]), this.writeInt32(t + 4, $t[qe ? 1 : 0]);
  }
  /**
   * Return the file identifier.   Behavior is undefined for FlatBuffers whose
   * schema does not include a file_identifier (likely points at padding or the
   * start of a the root vtable).
   */
  getBufferIdentifier() {
    if (this.bytes_.length < this.position_ + St + Mt)
      throw new Error("FlatBuffers: ByteBuffer is too short to contain an identifier.");
    let t = "";
    for (let e = 0; e < Mt; e++)
      t += String.fromCharCode(this.readInt8(this.position_ + St + e));
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
    t += St;
    const s = this.bytes_.subarray(t, t + n);
    return e === en.UTF8_BYTES ? s : this.text_decoder_.decode(s);
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
    return t + this.readInt32(t) + St;
  }
  /**
   * Get the length of a vector whose offset is stored at "offset" in this object.
   */
  __vector_len(t) {
    return this.readInt32(t + this.readInt32(t));
  }
  __has_identifier(t) {
    if (t.length != Mt)
      throw new Error("FlatBuffers: file identifier must be length " + Mt);
    for (let e = 0; e < Mt; e++)
      if (t.charCodeAt(e) != this.readInt8(this.position() + St + e))
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
}, Is = class Ss {
  /**
   * Create a FlatBufferBuilder.
   */
  constructor(t) {
    this.minalign = 1, this.vtable = null, this.vtable_in_use = 0, this.isNested = !1, this.object_start = 0, this.vtables = [], this.vector_num_elems = 0, this.force_defaults = !1, this.string_maps = null, this.text_encoder = new TextEncoder();
    let e;
    t ? e = t : e = 1024, this.bb = ge.allocate(e), this.space = e;
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
      this.bb = Ss.growByteBuffer(this.bb), this.space += this.bb.capacity() - s;
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
    const n = e << 1, s = ge.allocate(n);
    return s.setPosition(n - e), s.bytes().set(t.bytes(), n - e), s;
  }
  /**
   * Adds on offset, relative to where it will be written.
   *
   * @param offset The offset to add.
   */
  addOffset(t) {
    this.prep(St, 0), this.writeInt32(this.offset() - t + St);
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
    const r = (n + s) * Yi;
    this.addInt16(r);
    let o = 0;
    const a = this.space;
    t: for (e = 0; e < this.vtables.length; e++) {
      const c = this.bb.capacity() - this.vtables[e];
      if (r == this.bb.readInt16(c)) {
        for (let u = Yi; u < r; u += Yi)
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
      if (this.prep(this.minalign, St + Mt + s), r.length != Mt)
        throw new TypeError("FlatBuffers: file identifier must be length " + Mt);
      for (let o = Mt - 1; o >= 0; o--)
        this.writeInt8(r.charCodeAt(o));
    }
    this.prep(this.minalign, St + s), this.addOffset(t), s && this.addInt32(this.bb.capacity() - this.space), this.bb.setPosition(this.space);
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
    this.notNested(), this.vector_num_elems = e, this.prep(St, t * e), this.prep(n, t * e);
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
var ai;
(function(i) {
  i[i.BUFFER = 0] = "BUFFER";
})(ai || (ai = {}));
var ci;
(function(i) {
  i[i.LZ4_FRAME = 0] = "LZ4_FRAME", i[i.ZSTD = 1] = "ZSTD";
})(ci || (ci = {}));
class Yt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsBodyCompression(t, e) {
    return (e || new Yt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsBodyCompression(t, e) {
    return t.setPosition(t.position() + U), (e || new Yt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  /**
   * Compressor library.
   * For LZ4_FRAME, each compressed buffer must consist of a single frame.
   */
  codec() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt8(this.bb_pos + t) : ci.LZ4_FRAME;
  }
  /**
   * Indicates the way the record batch body was compressed
   */
  method() {
    const t = this.bb.__offset(this.bb_pos, 6);
    return t ? this.bb.readInt8(this.bb_pos + t) : ai.BUFFER;
  }
  static startBodyCompression(t) {
    t.startObject(2);
  }
  static addCodec(t, e) {
    t.addFieldInt8(0, e, ci.LZ4_FRAME);
  }
  static addMethod(t, e) {
    t.addFieldInt8(1, e, ai.BUFFER);
  }
  static endBodyCompression(t) {
    return t.endObject();
  }
  static createBodyCompression(t, e, n) {
    return Yt.startBodyCompression(t), Yt.addCodec(t, e), Yt.addMethod(t, n), Yt.endBodyCompression(t);
  }
}
class Bs {
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
}, Rt = class nn {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsRecordBatch(t, e) {
    return (e || new nn()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsRecordBatch(t, e) {
    return t.setPosition(t.position() + U), (e || new nn()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return n ? (e || new Bs()).__init(this.bb.__vector(this.bb_pos + n) + t * 16, this.bb) : null;
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
    return e ? (t || new Yt()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
}, ne = class sn {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsDictionaryBatch(t, e) {
    return (e || new sn()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsDictionaryBatch(t, e) {
    return t.setPosition(t.position() + U), (e || new sn()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  id() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt64(this.bb_pos + t) : BigInt("0");
  }
  data(t) {
    const e = this.bb.__offset(this.bb_pos, 6);
    return e ? (t || new Rt()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
var be;
(function(i) {
  i[i.Little = 0] = "Little", i[i.Big = 1] = "Big";
})(be || (be = {}));
var li;
(function(i) {
  i[i.DenseArray = 0] = "DenseArray";
})(li || (li = {}));
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
class Ct {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsDictionaryEncoding(t, e) {
    return (e || new Ct()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsDictionaryEncoding(t, e) {
    return t.setPosition(t.position() + U), (e || new Ct()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return t ? this.bb.readInt16(this.bb_pos + t) : li.DenseArray;
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
    t.addFieldInt16(3, e, li.DenseArray);
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
let Wn = class De {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsBinary(t, e) {
    return (e || new De()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsBinary(t, e) {
    return t.setPosition(t.position() + U), (e || new De()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startBinary(t) {
    t.startObject(0);
  }
  static endBinary(t) {
    return t.endObject();
  }
  static createBinary(t) {
    return De.startBinary(t), De.endBinary(t);
  }
}, Gn = class Fe {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsBool(t, e) {
    return (e || new Fe()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsBool(t, e) {
    return t.setPosition(t.position() + U), (e || new Fe()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startBool(t) {
    t.startObject(0);
  }
  static endBool(t) {
    return t.endObject();
  }
  static createBool(t) {
    return Fe.startBool(t), Fe.endBool(t);
  }
}, Qe = class se {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsDate(t, e) {
    return (e || new se()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsDate(t, e) {
    return t.setPosition(t.position() + U), (e || new se()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return se.startDate(t), se.addUnit(t, e), se.endDate(t);
  }
}, re = class jt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsDecimal(t, e) {
    return (e || new jt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsDecimal(t, e) {
    return t.setPosition(t.position() + U), (e || new jt()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return jt.startDecimal(t), jt.addPrecision(t, e), jt.addScale(t, n), jt.addBitWidth(t, s), jt.endDecimal(t);
  }
}, Ze = class oe {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsDuration(t, e) {
    return (e || new oe()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsDuration(t, e) {
    return t.setPosition(t.position() + U), (e || new oe()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return oe.startDuration(t), oe.addUnit(t, e), oe.endDuration(t);
  }
}, Xe = class ae {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsFixedSizeBinary(t, e) {
    return (e || new ae()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsFixedSizeBinary(t, e) {
    return t.setPosition(t.position() + U), (e || new ae()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return ae.startFixedSizeBinary(t), ae.addByteWidth(t, e), ae.endFixedSizeBinary(t);
  }
}, ti = class ce {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsFixedSizeList(t, e) {
    return (e || new ce()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsFixedSizeList(t, e) {
    return t.setPosition(t.position() + U), (e || new ce()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return ce.startFixedSizeList(t), ce.addListSize(t, e), ce.endFixedSizeList(t);
  }
};
class Bt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsFloatingPoint(t, e) {
    return (e || new Bt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsFloatingPoint(t, e) {
    return t.setPosition(t.position() + U), (e || new Bt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  precision() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : K.HALF;
  }
  static startFloatingPoint(t) {
    t.startObject(1);
  }
  static addPrecision(t, e) {
    t.addFieldInt16(0, e, K.HALF);
  }
  static endFloatingPoint(t) {
    return t.endObject();
  }
  static createFloatingPoint(t, e) {
    return Bt.startFloatingPoint(t), Bt.addPrecision(t, e), Bt.endFloatingPoint(t);
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
    return t ? this.bb.readInt16(this.bb_pos + t) : Ot.YEAR_MONTH;
  }
  static startInterval(t) {
    t.startObject(1);
  }
  static addUnit(t, e) {
    t.addFieldInt16(0, e, Ot.YEAR_MONTH);
  }
  static endInterval(t) {
    return t.endObject();
  }
  static createInterval(t, e) {
    return Tt.startInterval(t), Tt.addUnit(t, e), Tt.endInterval(t);
  }
}
let Hn = class Oe {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsLargeBinary(t, e) {
    return (e || new Oe()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsLargeBinary(t, e) {
    return t.setPosition(t.position() + U), (e || new Oe()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startLargeBinary(t) {
    t.startObject(0);
  }
  static endLargeBinary(t) {
    return t.endObject();
  }
  static createLargeBinary(t) {
    return Oe.startLargeBinary(t), Oe.endLargeBinary(t);
  }
}, qn = class Ee {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsLargeUtf8(t, e) {
    return (e || new Ee()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsLargeUtf8(t, e) {
    return t.setPosition(t.position() + U), (e || new Ee()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startLargeUtf8(t) {
    t.startObject(0);
  }
  static endLargeUtf8(t) {
    return t.endObject();
  }
  static createLargeUtf8(t) {
    return Ee.startLargeUtf8(t), Ee.endLargeUtf8(t);
  }
}, Kn = class Ne {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsList(t, e) {
    return (e || new Ne()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsList(t, e) {
    return t.setPosition(t.position() + U), (e || new Ne()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startList(t) {
    t.startObject(0);
  }
  static endList(t) {
    return t.endObject();
  }
  static createList(t) {
    return Ne.startList(t), Ne.endList(t);
  }
}, ei = class le {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsMap(t, e) {
    return (e || new le()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsMap(t, e) {
    return t.setPosition(t.position() + U), (e || new le()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return le.startMap(t), le.addKeysSorted(t, e), le.endMap(t);
  }
}, Jn = class Re {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsNull(t, e) {
    return (e || new Re()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsNull(t, e) {
    return t.setPosition(t.position() + U), (e || new Re()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startNull(t) {
    t.startObject(0);
  }
  static endNull(t) {
    return t.endObject();
  }
  static createNull(t) {
    return Re.startNull(t), Re.endNull(t);
  }
};
class Qt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsStruct_(t, e) {
    return (e || new Qt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsStruct_(t, e) {
    return t.setPosition(t.position() + U), (e || new Qt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startStruct_(t) {
    t.startObject(0);
  }
  static endStruct_(t) {
    return t.endObject();
  }
  static createStruct_(t) {
    return Qt.startStruct_(t), Qt.endStruct_(t);
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
let Qn = class Le {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsUtf8(t, e) {
    return (e || new Le()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsUtf8(t, e) {
    return t.setPosition(t.position() + U), (e || new Le()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startUtf8(t) {
    t.startObject(0);
  }
  static endUtf8(t) {
    return t.endObject();
  }
  static createUtf8(t) {
    return Le.startUtf8(t), Le.endUtf8(t);
  }
};
var z;
(function(i) {
  i[i.NONE = 0] = "NONE", i[i.Null = 1] = "Null", i[i.Int = 2] = "Int", i[i.FloatingPoint = 3] = "FloatingPoint", i[i.Binary = 4] = "Binary", i[i.Utf8 = 5] = "Utf8", i[i.Bool = 6] = "Bool", i[i.Decimal = 7] = "Decimal", i[i.Date = 8] = "Date", i[i.Time = 9] = "Time", i[i.Timestamp = 10] = "Timestamp", i[i.Interval = 11] = "Interval", i[i.List = 12] = "List", i[i.Struct_ = 13] = "Struct_", i[i.Union = 14] = "Union", i[i.FixedSizeBinary = 15] = "FixedSizeBinary", i[i.FixedSizeList = 16] = "FixedSizeList", i[i.Map = 17] = "Map", i[i.Duration = 18] = "Duration", i[i.LargeBinary = 19] = "LargeBinary", i[i.LargeUtf8 = 20] = "LargeUtf8", i[i.LargeList = 21] = "LargeList", i[i.RunEndEncoded = 22] = "RunEndEncoded";
})(z || (z = {}));
let ut = class ii {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsField(t, e) {
    return (e || new ii()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsField(t, e) {
    return t.setPosition(t.position() + U), (e || new ii()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return t ? this.bb.readUint8(this.bb_pos + t) : z.NONE;
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
    return e ? (t || new Ct()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
  }
  /**
   * children apply only to nested data types like Struct, List and Union. For
   * primitive types children will have length 0.
   */
  children(t, e) {
    const n = this.bb.__offset(this.bb_pos, 14);
    return n ? (e || new ii()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + n) + t * 4), this.bb) : null;
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
    t.addFieldInt8(2, e, z.NONE);
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
}, vt = class Nt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsSchema(t, e) {
    return (e || new Nt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsSchema(t, e) {
    return t.setPosition(t.position() + U), (e || new Nt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  /**
   * endianness of the buffer
   * it is Little Endian by default
   * if endianness doesn't match the underlying system then the vectors need to be converted
   */
  endianness() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : be.Little;
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
    t.addFieldInt16(0, e, be.Little);
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
    return Nt.startSchema(t), Nt.addEndianness(t, e), Nt.addFields(t, n), Nt.addCustomMetadata(t, s), Nt.addFeatures(t, r), Nt.endSchema(t);
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
var Lt;
(function(i) {
  i[i.OFFSET = 0] = "OFFSET", i[i.DATA = 1] = "DATA", i[i.VALIDITY = 2] = "VALIDITY", i[i.TYPE = 3] = "TYPE";
})(Lt || (Lt = {}));
const ko = void 0;
function Ce(i) {
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
  return typeof i[Symbol.toPrimitive] == "function" ? i[Symbol.toPrimitive]("string") : ArrayBuffer.isView(i) ? i instanceof BigInt64Array || i instanceof BigUint64Array ? `[${[...i].map((t) => Ce(t))}]` : `[${i}]` : ArrayBuffer.isView(i) ? `[${i}]` : JSON.stringify(i, (t, e) => typeof e == "bigint" ? `${e}` : e);
}
function x(i) {
  if (typeof i == "bigint" && (i < Number.MIN_SAFE_INTEGER || i > Number.MAX_SAFE_INTEGER))
    throw new TypeError(`${i} is not safe to convert to a number.`);
  return Number(i);
}
function As(i, t) {
  return x(i / t) + x(i % t) / x(t);
}
const xo = Symbol.for("isArrowBigNum");
function bt(i, ...t) {
  return t.length === 0 ? Object.setPrototypeOf(P(this.TypedArray, i), this.constructor.prototype) : Object.setPrototypeOf(new this.TypedArray(i, ...t), this.constructor.prototype);
}
bt.prototype[xo] = !0;
bt.prototype.toJSON = function() {
  return `"${ke(this)}"`;
};
bt.prototype.valueOf = function(i) {
  return Ds(this, i);
};
bt.prototype.toString = function() {
  return ke(this);
};
bt.prototype[Symbol.toPrimitive] = function(i = "default") {
  switch (i) {
    case "number":
      return Ds(this);
    case "string":
      return ke(this);
    case "default":
      return jo(this);
  }
  return ke(this);
};
function ye(...i) {
  return bt.apply(this, i);
}
function pe(...i) {
  return bt.apply(this, i);
}
function Pe(...i) {
  return bt.apply(this, i);
}
Object.setPrototypeOf(ye.prototype, Object.create(Int32Array.prototype));
Object.setPrototypeOf(pe.prototype, Object.create(Uint32Array.prototype));
Object.setPrototypeOf(Pe.prototype, Object.create(Uint32Array.prototype));
Object.assign(ye.prototype, bt.prototype, { constructor: ye, signed: !0, TypedArray: Int32Array, BigIntArray: BigInt64Array });
Object.assign(pe.prototype, bt.prototype, { constructor: pe, signed: !1, TypedArray: Uint32Array, BigIntArray: BigUint64Array });
Object.assign(Pe.prototype, bt.prototype, { constructor: Pe, signed: !0, TypedArray: Uint32Array, BigIntArray: BigUint64Array });
const zo = BigInt(4294967296) * BigInt(4294967296), Vo = zo - BigInt(1);
function Ds(i, t) {
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
    const d = BigInt(Math.pow(10, t)), h = c / d, j = c % d;
    return x(h) + x(j) / x(d);
  }
  return x(c);
}
function ke(i) {
  if (i.byteLength === 8)
    return `${new i.BigIntArray(i.buffer, i.byteOffset, 1)[0]}`;
  if (!i.signed)
    return Wi(i);
  let t = new Uint16Array(i.buffer, i.byteOffset, i.byteLength / 2);
  if (new Int16Array([t.at(-1)])[0] >= 0)
    return Wi(i);
  t = t.slice();
  let n = 1;
  for (let r = 0; r < t.length; r++) {
    const o = t[r], a = ~o + n;
    t[r] = a, n &= o === 0 ? 1 : 0;
  }
  return `-${Wi(t)}`;
}
function jo(i) {
  return i.byteLength === 8 ? new i.BigIntArray(i.buffer, i.byteOffset, 1)[0] : ke(i);
}
function Wi(i) {
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
class mn {
  /** @nocollapse */
  static new(t, e) {
    switch (e) {
      case !0:
        return new ye(t);
      case !1:
        return new pe(t);
    }
    switch (t.constructor) {
      case Int8Array:
      case Int16Array:
      case Int32Array:
      case BigInt64Array:
        return new ye(t);
    }
    return t.byteLength === 16 ? new Pe(t) : new pe(t);
  }
  /** @nocollapse */
  static signed(t) {
    return new ye(t);
  }
  /** @nocollapse */
  static unsigned(t) {
    return new pe(t);
  }
  /** @nocollapse */
  static decimal(t) {
    return new Pe(t);
  }
  constructor(t, e) {
    return mn.new(t, e);
  }
}
var Fs, Os, Es, Ns, Rs, Ls, Us, Ms, Cs, Ps, ks, xs, zs, Vs, js, $s, Ys, Ws, Gs, Hs, qs, Ks;
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
Fs = Symbol.toStringTag;
f[Fs] = ((i) => (i.children = null, i.ArrayType = Array, i.OffsetArrayType = Int32Array, i[Symbol.toStringTag] = "DataType"))(f.prototype);
class Wt extends f {
  constructor() {
    super(l.Null);
  }
  toString() {
    return "Null";
  }
}
Os = Symbol.toStringTag;
Wt[Os] = ((i) => i[Symbol.toStringTag] = "Null")(Wt.prototype);
class te extends f {
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
Es = Symbol.toStringTag;
te[Es] = ((i) => (i.isSigned = null, i.bitWidth = null, i[Symbol.toStringTag] = "Int"))(te.prototype);
class xe extends te {
  constructor() {
    super(!0, 32);
  }
  get ArrayType() {
    return Int32Array;
  }
}
Object.defineProperty(xe.prototype, "ArrayType", { value: Int32Array });
class ui extends f {
  constructor(t) {
    super(l.Float), this.precision = t;
  }
  get ArrayType() {
    switch (this.precision) {
      case K.HALF:
        return Uint16Array;
      case K.SINGLE:
        return Float32Array;
      case K.DOUBLE:
        return Float64Array;
    }
    throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
  }
  toString() {
    return `Float${this.precision << 5 || 16}`;
  }
}
Ns = Symbol.toStringTag;
ui[Ns] = ((i) => (i.precision = null, i[Symbol.toStringTag] = "Float"))(ui.prototype);
class di extends f {
  constructor() {
    super(l.Binary);
  }
  toString() {
    return "Binary";
  }
}
Rs = Symbol.toStringTag;
di[Rs] = ((i) => (i.ArrayType = Uint8Array, i[Symbol.toStringTag] = "Binary"))(di.prototype);
class hi extends f {
  constructor() {
    super(l.LargeBinary);
  }
  toString() {
    return "LargeBinary";
  }
}
Ls = Symbol.toStringTag;
hi[Ls] = ((i) => (i.ArrayType = Uint8Array, i.OffsetArrayType = BigInt64Array, i[Symbol.toStringTag] = "LargeBinary"))(hi.prototype);
class fi extends f {
  constructor() {
    super(l.Utf8);
  }
  toString() {
    return "Utf8";
  }
}
Us = Symbol.toStringTag;
fi[Us] = ((i) => (i.ArrayType = Uint8Array, i[Symbol.toStringTag] = "Utf8"))(fi.prototype);
class yi extends f {
  constructor() {
    super(l.LargeUtf8);
  }
  toString() {
    return "LargeUtf8";
  }
}
Ms = Symbol.toStringTag;
yi[Ms] = ((i) => (i.ArrayType = Uint8Array, i.OffsetArrayType = BigInt64Array, i[Symbol.toStringTag] = "LargeUtf8"))(yi.prototype);
class pi extends f {
  constructor() {
    super(l.Bool);
  }
  toString() {
    return "Bool";
  }
}
Cs = Symbol.toStringTag;
pi[Cs] = ((i) => (i.ArrayType = Uint8Array, i[Symbol.toStringTag] = "Bool"))(pi.prototype);
class mi extends f {
  constructor(t, e, n = 128) {
    super(l.Decimal), this.scale = t, this.precision = e, this.bitWidth = n;
  }
  toString() {
    return `Decimal[${this.precision}e${this.scale > 0 ? "+" : ""}${this.scale}]`;
  }
}
Ps = Symbol.toStringTag;
mi[Ps] = ((i) => (i.scale = null, i.precision = null, i.ArrayType = Uint32Array, i[Symbol.toStringTag] = "Decimal"))(mi.prototype);
class _i extends f {
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
ks = Symbol.toStringTag;
_i[ks] = ((i) => (i.unit = null, i[Symbol.toStringTag] = "Date"))(_i.prototype);
class gi extends f {
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
xs = Symbol.toStringTag;
gi[xs] = ((i) => (i.unit = null, i.bitWidth = null, i[Symbol.toStringTag] = "Time"))(gi.prototype);
class bi extends f {
  constructor(t, e) {
    super(l.Timestamp), this.unit = t, this.timezone = e;
  }
  toString() {
    return `Timestamp<${g[this.unit]}${this.timezone ? `, ${this.timezone}` : ""}>`;
  }
}
zs = Symbol.toStringTag;
bi[zs] = ((i) => (i.unit = null, i.timezone = null, i.ArrayType = BigInt64Array, i[Symbol.toStringTag] = "Timestamp"))(bi.prototype);
class wi extends f {
  constructor(t) {
    super(l.Interval), this.unit = t;
  }
  toString() {
    return `Interval<${Ot[this.unit]}>`;
  }
}
Vs = Symbol.toStringTag;
wi[Vs] = ((i) => (i.unit = null, i.ArrayType = Int32Array, i[Symbol.toStringTag] = "Interval"))(wi.prototype);
class vi extends f {
  constructor(t) {
    super(l.Duration), this.unit = t;
  }
  toString() {
    return `Duration<${g[this.unit]}>`;
  }
}
js = Symbol.toStringTag;
vi[js] = ((i) => (i.unit = null, i.ArrayType = BigInt64Array, i[Symbol.toStringTag] = "Duration"))(vi.prototype);
class Ii extends f {
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
$s = Symbol.toStringTag;
Ii[$s] = ((i) => (i.children = null, i[Symbol.toStringTag] = "List"))(Ii.prototype);
class X extends f {
  constructor(t) {
    super(l.Struct), this.children = t;
  }
  toString() {
    return `Struct<{${this.children.map((t) => `${t.name}:${t.type}`).join(", ")}}>`;
  }
}
Ys = Symbol.toStringTag;
X[Ys] = ((i) => (i.children = null, i[Symbol.toStringTag] = "Struct"))(X.prototype);
class Si extends f {
  constructor(t, e, n) {
    super(l.Union), this.mode = t, this.children = n, this.typeIds = e = Int32Array.from(e), this.typeIdToChildIndex = e.reduce((s, r, o) => (s[r] = o) && s || s, /* @__PURE__ */ Object.create(null));
  }
  toString() {
    return `${this[Symbol.toStringTag]}<${this.children.map((t) => `${t.type}`).join(" | ")}>`;
  }
}
Ws = Symbol.toStringTag;
Si[Ws] = ((i) => (i.mode = null, i.typeIds = null, i.children = null, i.typeIdToChildIndex = null, i.ArrayType = Int8Array, i[Symbol.toStringTag] = "Union"))(Si.prototype);
class Bi extends f {
  constructor(t) {
    super(l.FixedSizeBinary), this.byteWidth = t;
  }
  toString() {
    return `FixedSizeBinary[${this.byteWidth}]`;
  }
}
Gs = Symbol.toStringTag;
Bi[Gs] = ((i) => (i.byteWidth = null, i.ArrayType = Uint8Array, i[Symbol.toStringTag] = "FixedSizeBinary"))(Bi.prototype);
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
Hs = Symbol.toStringTag;
Ti[Hs] = ((i) => (i.children = null, i.listSize = null, i[Symbol.toStringTag] = "FixedSizeList"))(Ti.prototype);
class Ai extends f {
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
qs = Symbol.toStringTag;
Ai[qs] = ((i) => (i.children = null, i.keysSorted = null, i[Symbol.toStringTag] = "Map_"))(Ai.prototype);
const $o = /* @__PURE__ */ ((i) => () => ++i)(-1);
class we extends f {
  constructor(t, e, n, s) {
    super(l.Dictionary), this.indices = e, this.dictionary = t, this.isOrdered = s || !1, this.id = n == null ? $o() : x(n);
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
Ks = Symbol.toStringTag;
we[Ks] = ((i) => (i.id = null, i.indices = null, i.isOrdered = null, i.dictionary = null, i[Symbol.toStringTag] = "Dictionary"))(we.prototype);
function Ut(i) {
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
class A {
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
    return ue(this, t, e);
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
  return typeof t == "number" ? ue(i, t, e) : typeof t == "string" && t in l ? ue(i, l[t], e) : t && t instanceof f ? ue(i, Zn(t), e) : t?.type && t.type instanceof f ? ue(i, Zn(t.type), e) : ue(i, l.NONE, e);
}
function ue(i, t, e = !0) {
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
function Zn(i) {
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
        case K.HALF:
          return l.Float16;
        case K.SINGLE:
          return l.Float32;
        case K.DOUBLE:
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
        case Ot.DAY_TIME:
          return l.IntervalDayTime;
        case Ot.YEAR_MONTH:
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
A.prototype.visitInt8 = null;
A.prototype.visitInt16 = null;
A.prototype.visitInt32 = null;
A.prototype.visitInt64 = null;
A.prototype.visitUint8 = null;
A.prototype.visitUint16 = null;
A.prototype.visitUint32 = null;
A.prototype.visitUint64 = null;
A.prototype.visitFloat16 = null;
A.prototype.visitFloat32 = null;
A.prototype.visitFloat64 = null;
A.prototype.visitDateDay = null;
A.prototype.visitDateMillisecond = null;
A.prototype.visitTimestampSecond = null;
A.prototype.visitTimestampMillisecond = null;
A.prototype.visitTimestampMicrosecond = null;
A.prototype.visitTimestampNanosecond = null;
A.prototype.visitTimeSecond = null;
A.prototype.visitTimeMillisecond = null;
A.prototype.visitTimeMicrosecond = null;
A.prototype.visitTimeNanosecond = null;
A.prototype.visitDenseUnion = null;
A.prototype.visitSparseUnion = null;
A.prototype.visitIntervalDayTime = null;
A.prototype.visitIntervalYearMonth = null;
A.prototype.visitDuration = null;
A.prototype.visitDurationSecond = null;
A.prototype.visitDurationMillisecond = null;
A.prototype.visitDurationMicrosecond = null;
A.prototype.visitDurationNanosecond = null;
const Js = new Float64Array(1), ie = new Uint32Array(Js.buffer);
function Qs(i) {
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
  const t = (ie[1] & 2147483648) >> 16 & 65535;
  let e = ie[1] & 2146435072, n = 0;
  return e >= 1089470464 ? ie[0] > 0 ? e = 31744 : (e = (e & 2080374784) >> 16, n = (ie[1] & 1048575) >> 10) : e <= 1056964608 ? (n = 1048576 + (ie[1] & 1048575), n = 1048576 + (n << (e >> 20) - 998) >> 21, e = 0) : (e = e - 1056964608 >> 10, n = (ie[1] & 1048575) + 512 >> 10), t | e | n & 65535;
}
class b extends A {
}
function I(i) {
  return (t, e, n) => {
    if (t.setValid(e, n != null))
      return i(t, e, n);
  };
}
const Go = (i, t, e) => {
  i[t] = Math.floor(e / 864e5);
}, Zs = (i, t, e, n) => {
  if (e + 1 < t.length) {
    const s = x(t[e]), r = x(t[e + 1]);
    i.set(n.subarray(0, r - s), s);
  }
}, Ho = ({ offset: i, values: t }, e, n) => {
  const s = i + e;
  n ? t[s >> 3] |= 1 << s % 8 : t[s >> 3] &= ~(1 << s % 8);
}, Pt = ({ values: i }, t, e) => {
  i[t] = e;
}, _n = ({ values: i }, t, e) => {
  i[t] = e;
}, Xs = ({ values: i }, t, e) => {
  i[t] = Wo(e);
}, qo = (i, t, e) => {
  switch (i.type.precision) {
    case K.HALF:
      return Xs(i, t, e);
    case K.SINGLE:
    case K.DOUBLE:
      return _n(i, t, e);
  }
}, tr = ({ values: i }, t, e) => {
  Go(i, t, e.valueOf());
}, er = ({ values: i }, t, e) => {
  i[t] = BigInt(e);
}, Ko = ({ stride: i, values: t }, e, n) => {
  t.set(n.subarray(0, i), i * e);
}, ir = ({ values: i, valueOffsets: t }, e, n) => Zs(i, t, e, n), nr = ({ values: i, valueOffsets: t }, e, n) => Zs(i, t, e, fn(n)), Jo = (i, t, e) => {
  i.type.unit === pt.DAY ? tr(i, t, e) : er(i, t, e);
}, sr = ({ values: i }, t, e) => {
  i[t] = BigInt(e / 1e3);
}, rr = ({ values: i }, t, e) => {
  i[t] = BigInt(e);
}, or = ({ values: i }, t, e) => {
  i[t] = BigInt(e * 1e3);
}, ar = ({ values: i }, t, e) => {
  i[t] = BigInt(e * 1e6);
}, Qo = (i, t, e) => {
  switch (i.type.unit) {
    case g.SECOND:
      return sr(i, t, e);
    case g.MILLISECOND:
      return rr(i, t, e);
    case g.MICROSECOND:
      return or(i, t, e);
    case g.NANOSECOND:
      return ar(i, t, e);
  }
}, cr = ({ values: i }, t, e) => {
  i[t] = e;
}, lr = ({ values: i }, t, e) => {
  i[t] = e;
}, ur = ({ values: i }, t, e) => {
  i[t] = e;
}, dr = ({ values: i }, t, e) => {
  i[t] = e;
}, Zo = (i, t, e) => {
  switch (i.type.unit) {
    case g.SECOND:
      return cr(i, t, e);
    case g.MILLISECOND:
      return lr(i, t, e);
    case g.MICROSECOND:
      return ur(i, t, e);
    case g.NANOSECOND:
      return dr(i, t, e);
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
  i.type.mode === J.Dense ? hr(i, t, e) : fr(i, t, e);
}, hr = (i, t, e) => {
  const n = i.type.typeIdToChildIndex[i.typeIds[t]], s = i.children[n];
  mt.visit(s, i.valueOffsets[t], e);
}, fr = (i, t, e) => {
  const n = i.type.typeIdToChildIndex[i.typeIds[t]], s = i.children[n];
  mt.visit(s, t, e);
}, ca = (i, t, e) => {
  var n;
  (n = i.dictionary) === null || n === void 0 || n.set(i.values[t], e);
}, la = (i, t, e) => {
  i.type.unit === Ot.DAY_TIME ? yr(i, t, e) : pr(i, t, e);
}, yr = ({ values: i }, t, e) => {
  i.set(e.subarray(0, 2), 2 * t);
}, pr = ({ values: i }, t, e) => {
  i[t] = e[0] * 12 + e[1] % 12;
}, mr = ({ values: i }, t, e) => {
  i[t] = e;
}, _r = ({ values: i }, t, e) => {
  i[t] = e;
}, gr = ({ values: i }, t, e) => {
  i[t] = e;
}, br = ({ values: i }, t, e) => {
  i[t] = e;
}, ua = (i, t, e) => {
  switch (i.type.unit) {
    case g.SECOND:
      return mr(i, t, e);
    case g.MILLISECOND:
      return _r(i, t, e);
    case g.MICROSECOND:
      return gr(i, t, e);
    case g.NANOSECOND:
      return br(i, t, e);
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
b.prototype.visitInt = I(Pt);
b.prototype.visitInt8 = I(Pt);
b.prototype.visitInt16 = I(Pt);
b.prototype.visitInt32 = I(Pt);
b.prototype.visitInt64 = I(Pt);
b.prototype.visitUint8 = I(Pt);
b.prototype.visitUint16 = I(Pt);
b.prototype.visitUint32 = I(Pt);
b.prototype.visitUint64 = I(Pt);
b.prototype.visitFloat = I(qo);
b.prototype.visitFloat16 = I(Xs);
b.prototype.visitFloat32 = I(_n);
b.prototype.visitFloat64 = I(_n);
b.prototype.visitUtf8 = I(nr);
b.prototype.visitLargeUtf8 = I(nr);
b.prototype.visitBinary = I(ir);
b.prototype.visitLargeBinary = I(ir);
b.prototype.visitFixedSizeBinary = I(Ko);
b.prototype.visitDate = I(Jo);
b.prototype.visitDateDay = I(tr);
b.prototype.visitDateMillisecond = I(er);
b.prototype.visitTimestamp = I(Qo);
b.prototype.visitTimestampSecond = I(sr);
b.prototype.visitTimestampMillisecond = I(rr);
b.prototype.visitTimestampMicrosecond = I(or);
b.prototype.visitTimestampNanosecond = I(ar);
b.prototype.visitTime = I(Zo);
b.prototype.visitTimeSecond = I(cr);
b.prototype.visitTimeMillisecond = I(lr);
b.prototype.visitTimeMicrosecond = I(ur);
b.prototype.visitTimeNanosecond = I(dr);
b.prototype.visitDecimal = I(Xo);
b.prototype.visitList = I(ta);
b.prototype.visitStruct = I(oa);
b.prototype.visitUnion = I(aa);
b.prototype.visitDenseUnion = I(hr);
b.prototype.visitSparseUnion = I(fr);
b.prototype.visitDictionary = I(ca);
b.prototype.visitInterval = I(la);
b.prototype.visitIntervalDayTime = I(yr);
b.prototype.visitIntervalYearMonth = I(pr);
b.prototype.visitDuration = I(ua);
b.prototype.visitDurationSecond = I(mr);
b.prototype.visitDurationMillisecond = I(_r);
b.prototype.visitDurationMicrosecond = I(gr);
b.prototype.visitDurationNanosecond = I(br);
b.prototype.visitFixedSizeList = I(da);
b.prototype.visitMap = I(ea);
const mt = new b(), _t = Symbol.for("parent"), me = Symbol.for("rowIndex");
class gn {
  constructor(t, e) {
    return this[_t] = t, this[me] = e, new Proxy(this, new fa());
  }
  toArray() {
    return Object.values(this.toJSON());
  }
  toJSON() {
    const t = this[me], e = this[_t], n = e.type.children, s = {};
    for (let r = -1, o = n.length; ++r < o; )
      s[n[r].name] = ot.visit(e.children[r], t);
    return s;
  }
  toString() {
    return `{${[...this].map(([t, e]) => `${Ce(t)}: ${Ce(e)}`).join(", ")}}`;
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toString();
  }
  [Symbol.iterator]() {
    return new ha(this[_t], this[me]);
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
Object.defineProperties(gn.prototype, {
  [Symbol.toStringTag]: { enumerable: !1, configurable: !1, value: "Row" },
  [_t]: { writable: !0, enumerable: !1, configurable: !1, value: null },
  [me]: { writable: !0, enumerable: !1, configurable: !1, value: -1 }
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
      const s = ot.visit(t[_t].children[n], t[me]);
      return Reflect.set(t, e, s), s;
    }
  }
  set(t, e, n) {
    const s = t[_t].type.children.findIndex((r) => r.name === e);
    return s !== -1 ? (mt.visit(t[_t].children[s], t[me], n), Reflect.set(t, e, n)) : Reflect.has(t, e) || typeof e == "symbol" ? Reflect.set(t, e, n) : !1;
  }
}
class y extends A {
}
function w(i) {
  return (t, e) => t.getValid(e) ? i(t, e) : null;
}
const ya = (i, t) => 864e5 * i[t], pa = (i, t) => null, wr = (i, t, e) => {
  if (e + 1 >= t.length)
    return null;
  const n = x(t[e]), s = x(t[e + 1]);
  return i.subarray(n, s);
}, ma = ({ offset: i, values: t }, e) => {
  const n = i + e;
  return (t[n >> 3] & 1 << n % 8) !== 0;
}, vr = ({ values: i }, t) => ya(i, t), Ir = ({ values: i }, t) => x(i[t]), Kt = ({ stride: i, values: t }, e) => t[i * e], _a = ({ stride: i, values: t }, e) => Qs(t[i * e]), Sr = ({ values: i }, t) => i[t], ga = ({ stride: i, values: t }, e) => t.subarray(i * e, i * (e + 1)), Br = ({ values: i, valueOffsets: t }, e) => wr(i, t, e), Tr = ({ values: i, valueOffsets: t }, e) => {
  const n = wr(i, t, e);
  return n !== null ? Zi(n) : null;
}, ba = ({ values: i }, t) => i[t], wa = ({ type: i, values: t }, e) => i.precision !== K.HALF ? t[e] : Qs(t[e]), va = (i, t) => i.type.unit === pt.DAY ? vr(i, t) : Ir(i, t), Ar = ({ values: i }, t) => 1e3 * x(i[t]), Dr = ({ values: i }, t) => x(i[t]), Fr = ({ values: i }, t) => As(i[t], BigInt(1e3)), Or = ({ values: i }, t) => As(i[t], BigInt(1e6)), Ia = (i, t) => {
  switch (i.type.unit) {
    case g.SECOND:
      return Ar(i, t);
    case g.MILLISECOND:
      return Dr(i, t);
    case g.MICROSECOND:
      return Fr(i, t);
    case g.NANOSECOND:
      return Or(i, t);
  }
}, Er = ({ values: i }, t) => i[t], Nr = ({ values: i }, t) => i[t], Rr = ({ values: i }, t) => i[t], Lr = ({ values: i }, t) => i[t], Sa = (i, t) => {
  switch (i.type.unit) {
    case g.SECOND:
      return Er(i, t);
    case g.MILLISECOND:
      return Nr(i, t);
    case g.MICROSECOND:
      return Rr(i, t);
    case g.NANOSECOND:
      return Lr(i, t);
  }
}, Ba = ({ values: i, stride: t }, e) => mn.decimal(i.subarray(t * e, t * (e + 1))), Ta = (i, t) => {
  const { valueOffsets: e, stride: n, children: s } = i, { [t * n]: r, [t * n + 1]: o } = e, c = s[0].slice(r, o - r);
  return new R([c]);
}, Aa = (i, t) => {
  const { valueOffsets: e, children: n } = i, { [t]: s, [t + 1]: r } = e, o = n[0];
  return new bn(o.slice(s, r - s));
}, Da = (i, t) => new gn(i, t), Fa = (i, t) => i.type.mode === J.Dense ? Ur(i, t) : Mr(i, t), Ur = (i, t) => {
  const e = i.type.typeIdToChildIndex[i.typeIds[t]], n = i.children[e];
  return ot.visit(n, i.valueOffsets[t]);
}, Mr = (i, t) => {
  const e = i.type.typeIdToChildIndex[i.typeIds[t]], n = i.children[e];
  return ot.visit(n, t);
}, Oa = (i, t) => {
  var e;
  return (e = i.dictionary) === null || e === void 0 ? void 0 : e.get(i.values[t]);
}, Ea = (i, t) => i.type.unit === Ot.DAY_TIME ? Cr(i, t) : Pr(i, t), Cr = ({ values: i }, t) => i.subarray(2 * t, 2 * (t + 1)), Pr = ({ values: i }, t) => {
  const e = i[t], n = new Int32Array(2);
  return n[0] = Math.trunc(e / 12), n[1] = Math.trunc(e % 12), n;
}, kr = ({ values: i }, t) => i[t], xr = ({ values: i }, t) => i[t], zr = ({ values: i }, t) => i[t], Vr = ({ values: i }, t) => i[t], Na = (i, t) => {
  switch (i.type.unit) {
    case g.SECOND:
      return kr(i, t);
    case g.MILLISECOND:
      return xr(i, t);
    case g.MICROSECOND:
      return zr(i, t);
    case g.NANOSECOND:
      return Vr(i, t);
  }
}, Ra = (i, t) => {
  const { stride: e, children: n } = i, r = n[0].slice(t * e, e);
  return new R([r]);
};
y.prototype.visitNull = w(pa);
y.prototype.visitBool = w(ma);
y.prototype.visitInt = w(ba);
y.prototype.visitInt8 = w(Kt);
y.prototype.visitInt16 = w(Kt);
y.prototype.visitInt32 = w(Kt);
y.prototype.visitInt64 = w(Sr);
y.prototype.visitUint8 = w(Kt);
y.prototype.visitUint16 = w(Kt);
y.prototype.visitUint32 = w(Kt);
y.prototype.visitUint64 = w(Sr);
y.prototype.visitFloat = w(wa);
y.prototype.visitFloat16 = w(_a);
y.prototype.visitFloat32 = w(Kt);
y.prototype.visitFloat64 = w(Kt);
y.prototype.visitUtf8 = w(Tr);
y.prototype.visitLargeUtf8 = w(Tr);
y.prototype.visitBinary = w(Br);
y.prototype.visitLargeBinary = w(Br);
y.prototype.visitFixedSizeBinary = w(ga);
y.prototype.visitDate = w(va);
y.prototype.visitDateDay = w(vr);
y.prototype.visitDateMillisecond = w(Ir);
y.prototype.visitTimestamp = w(Ia);
y.prototype.visitTimestampSecond = w(Ar);
y.prototype.visitTimestampMillisecond = w(Dr);
y.prototype.visitTimestampMicrosecond = w(Fr);
y.prototype.visitTimestampNanosecond = w(Or);
y.prototype.visitTime = w(Sa);
y.prototype.visitTimeSecond = w(Er);
y.prototype.visitTimeMillisecond = w(Nr);
y.prototype.visitTimeMicrosecond = w(Rr);
y.prototype.visitTimeNanosecond = w(Lr);
y.prototype.visitDecimal = w(Ba);
y.prototype.visitList = w(Ta);
y.prototype.visitStruct = w(Da);
y.prototype.visitUnion = w(Fa);
y.prototype.visitDenseUnion = w(Ur);
y.prototype.visitSparseUnion = w(Mr);
y.prototype.visitDictionary = w(Oa);
y.prototype.visitInterval = w(Ea);
y.prototype.visitIntervalDayTime = w(Cr);
y.prototype.visitIntervalYearMonth = w(Pr);
y.prototype.visitDuration = w(Na);
y.prototype.visitDurationSecond = w(kr);
y.prototype.visitDurationMillisecond = w(xr);
y.prototype.visitDurationMicrosecond = w(zr);
y.prototype.visitDurationNanosecond = w(Vr);
y.prototype.visitFixedSizeList = w(Ra);
y.prototype.visitMap = w(Aa);
const ot = new y(), de = Symbol.for("keys"), _e = Symbol.for("vals"), he = Symbol.for("kKeysAsStrings"), rn = Symbol.for("_kKeysAsStrings");
class bn {
  constructor(t) {
    return this[de] = new R([t.children[0]]).memoize(), this[_e] = t.children[1], new Proxy(this, new Ua());
  }
  /** @ignore */
  get [he]() {
    return this[rn] || (this[rn] = Array.from(this[de].toArray(), String));
  }
  [Symbol.iterator]() {
    return new La(this[de], this[_e]);
  }
  get size() {
    return this[de].length;
  }
  toArray() {
    return Object.values(this.toJSON());
  }
  toJSON() {
    const t = this[de], e = this[_e], n = {};
    for (let s = -1, r = t.length; ++s < r; )
      n[t.get(s)] = ot.visit(e, s);
    return n;
  }
  toString() {
    return `{${[...this].map(([t, e]) => `${Ce(t)}: ${Ce(e)}`).join(", ")}}`;
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
    return t[he];
  }
  has(t, e) {
    return t[he].includes(e);
  }
  getOwnPropertyDescriptor(t, e) {
    if (t[he].indexOf(e) !== -1)
      return { writable: !0, enumerable: !0, configurable: !0 };
  }
  get(t, e) {
    if (Reflect.has(t, e))
      return t[e];
    const n = t[he].indexOf(e);
    if (n !== -1) {
      const s = ot.visit(Reflect.get(t, _e), n);
      return Reflect.set(t, e, s), s;
    }
  }
  set(t, e, n) {
    const s = t[he].indexOf(e);
    return s !== -1 ? (mt.visit(Reflect.get(t, _e), s, n), Reflect.set(t, e, n)) : Reflect.has(t, e) ? Reflect.set(t, e, n) : !1;
  }
}
Object.defineProperties(bn.prototype, {
  [Symbol.toStringTag]: { enumerable: !1, configurable: !1, value: "Row" },
  [de]: { writable: !0, enumerable: !1, configurable: !1, value: null },
  [_e]: { writable: !0, enumerable: !1, configurable: !1, value: null },
  [rn]: { writable: !0, enumerable: !1, configurable: !1, value: null }
});
let Xn;
function jr(i, t, e, n) {
  const { length: s = 0 } = i;
  let r = typeof t != "number" ? 0 : t, o = typeof e != "number" ? s : e;
  return r < 0 && (r = (r % s + s) % s), o < 0 && (o = (o % s + s) % s), o < r && (Xn = r, r = o, o = Xn), o > s && (o = s), n ? n(i, r, o) : [r, o];
}
const wn = (i, t) => i < 0 ? t + i : i, ts = (i) => i !== i;
function Be(i) {
  if (typeof i !== "object" || i === null)
    return ts(i) ? ts : (e) => e === i;
  if (i instanceof Date) {
    const e = i.valueOf();
    return (n) => n instanceof Date ? n.valueOf() === e : !1;
  }
  return ArrayBuffer.isView(i) ? (e) => e ? Ro(i, e) : !1 : i instanceof Map ? Ca(i) : Array.isArray(i) ? Ma(i) : i instanceof R ? Pa(i) : ka(i, !0);
}
function Ma(i) {
  const t = [];
  for (let e = -1, n = i.length; ++e < n; )
    t[e] = Be(i[e]);
  return xi(t);
}
function Ca(i) {
  let t = -1;
  const e = [];
  for (const n of i.values())
    e[++t] = Be(n);
  return xi(e);
}
function Pa(i) {
  const t = [];
  for (let e = -1, n = i.length; ++e < n; )
    t[e] = Be(i.get(e));
  return xi(t);
}
function ka(i, t = !1) {
  const e = Object.keys(i);
  if (!t && e.length === 0)
    return () => !1;
  const n = [];
  for (let s = -1, r = e.length; ++s < r; )
    n[s] = Be(i[e[s]]);
  return xi(n, e);
}
function xi(i, t) {
  return (e) => {
    if (!e || typeof e != "object")
      return !1;
    switch (e.constructor) {
      case Array:
        return xa(i, e);
      case Map:
        return es(i, e, e.keys());
      case bn:
      case gn:
      case Object:
      case void 0:
        return es(i, e, t || Object.keys(e));
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
function es(i, t, e) {
  const n = e[Symbol.iterator](), s = t instanceof Map ? t.keys() : Object.keys(t)[Symbol.iterator](), r = t instanceof Map ? t.values() : Object.values(t)[Symbol.iterator]();
  let o = 0;
  const a = i.length;
  let c = r.next(), u = n.next(), d = s.next();
  for (; o < a && !u.done && !d.done && !c.done && !(u.value !== d.value || !i[o](c.value)); ++o, u = n.next(), d = s.next(), c = r.next())
    ;
  return o === a && u.done && d.done && c.done ? !0 : (n.return && n.return(), s.return && s.return(), r.return && r.return(), !1);
}
function $r(i, t, e, n) {
  return (e & 1 << n) !== 0;
}
function Va(i, t, e, n) {
  return (e & 1 << n) >> n;
}
function Di(i, t, e) {
  const n = e.byteLength + 7 & -8;
  if (i > 0 || e.byteLength < n) {
    const s = new Uint8Array(n);
    return s.set(i % 8 === 0 ? e.subarray(i >> 3) : (
      // Otherwise iterate each bit from the offset and return a new one
      Fi(new vn(e, i, t, null, $r)).subarray(0, n)
    )), s;
  }
  return e;
}
function Fi(i) {
  const t = [];
  let e = 0, n = 0, s = 0;
  for (const o of i)
    o && (s |= 1 << n), ++n === 8 && (t[e++] = s, s = n = 0);
  (e === 0 || n > 0) && (t[e++] = s);
  const r = new Uint8Array(t.length + 7 & -8);
  return r.set(t), r;
}
class vn {
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
function on(i, t, e) {
  if (e - t <= 0)
    return 0;
  if (e - t < 8) {
    let r = 0;
    for (const o of new vn(i, t, e - t, i, Va))
      r += o;
    return r;
  }
  const n = e >> 3 << 3, s = t + (t % 8 === 0 ? 0 : 8 - t % 8);
  return (
    // Get the popcnt of bits between the left hand side, and the next highest multiple of 8
    on(i, t, s) + // Get the popcnt of bits between the right hand side, and the next lowest multiple of 8
    on(i, n, e) + // Get the popcnt of all bits between the left and right hand sides' multiples of 8
    ja(i, s >> 3, n - s >> 3)
  );
}
function ja(i, t, e) {
  let n = 0, s = Math.trunc(t);
  const r = new DataView(i.buffer, i.byteOffset, i.byteLength), o = e === void 0 ? i.byteLength : s + e;
  for (; o - s >= 4; )
    n += Gi(r.getUint32(s)), s += 4;
  for (; o - s >= 2; )
    n += Gi(r.getUint16(s)), s += 2;
  for (; o - s >= 1; )
    n += Gi(r.getUint8(s)), s += 1;
  return n;
}
function Gi(i) {
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
    ) : this.length - on(e, this.offset, this.offset + this.length)), t;
  }
  constructor(t, e, n, s, r, o = [], a) {
    this.type = t, this.children = o, this.dictionary = a, this.offset = Math.floor(Math.max(e || 0, 0)), this.length = Math.floor(Math.max(n || 0, 0)), this._nullCount = Math.floor(Math.max(s || 0, -1));
    let c;
    r instanceof M ? (this.stride = r.stride, this.values = r.values, this.typeIds = r.typeIds, this.nullBitmap = r.nullBitmap, this.valueOffsets = r.valueOffsets) : (this.stride = Ut(t), r && ((c = r[0]) && (this.valueOffsets = c), (c = r[1]) && (this.values = c), (c = r[2]) && (this.nullBitmap = c), (c = r[3]) && (this.typeIds = c)));
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
      (!r || r.byteLength <= d) && (r = new Uint8Array((o + a + 63 & -64) >> 3).fill(255), this.nullCount > 0 ? (r.set(Di(o, a, this.nullBitmap), 0), Object.assign(this, { nullBitmap: r })) : Object.assign(this, { nullBitmap: r, _nullCount: 0 }));
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
    s[e >> 3] = (1 << e - (e & -8)) - 1, n > 0 && s.set(Di(this.offset, e, this.nullBitmap), 0);
    const r = this.buffers;
    return r[Lt.VALIDITY] = s, this.clone(this.type, 0, t, n + (t - e), r);
  }
  _sliceBuffers(t, e, n, s) {
    let r;
    const { buffers: o } = this;
    return (r = o[Lt.TYPE]) && (o[Lt.TYPE] = r.subarray(t, t + e)), (r = o[Lt.OFFSET]) && (o[Lt.OFFSET] = r.subarray(t, t + e + 1)) || // Otherwise if no offsets, slice the data buffer. Don't slice the data vector for Booleans, since the offset goes by bits not bytes
    (r = o[Lt.DATA]) && (o[Lt.DATA] = s === 6 ? r : r.subarray(n * t, n * (t + e))), o;
  }
  _sliceChildren(t, e, n) {
    return t.map((s) => s.slice(e, n));
  }
}
M.prototype.children = Object.freeze([]);
class Me extends A {
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
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.data), r = O(t.nullBitmap), o = Ae(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, s, r]);
  }
  visitLargeUtf8(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.data), r = O(t.nullBitmap), o = jn(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, s, r]);
  }
  visitBinary(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.data), r = O(t.nullBitmap), o = Ae(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, s, r]);
  }
  visitLargeBinary(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.data), r = O(t.nullBitmap), o = jn(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, s, r]);
  }
  visitFixedSizeBinary(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length / Ut(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitDate(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length / Ut(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitTimestamp(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length / Ut(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitTime(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length / Ut(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitDecimal(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length / Ut(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitList(t) {
    const { ["type"]: e, ["offset"]: n = 0, ["child"]: s } = t, r = O(t.nullBitmap), o = Ae(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
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
    const c = Ae(t.valueOffsets);
    return new M(e, n, o, a, [c, void 0, void 0, r], s);
  }
  visitDictionary(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.indices.ArrayType, t.data), { ["dictionary"]: o = new R([new Me().visit({ type: e.dictionary })]) } = t, { ["length"]: a = r.length, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [void 0, r, s], [], o);
  }
  visitInterval(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length / Ut(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitDuration(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.ArrayType, t.data), { ["length"]: o = r.length, ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, r, s]);
  }
  visitFixedSizeList(t) {
    const { ["type"]: e, ["offset"]: n = 0, ["child"]: s = new Me().visit({ type: e.valueType }) } = t, r = O(t.nullBitmap), { ["length"]: o = s.length / Ut(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, void 0, r], [s]);
  }
  visitMap(t) {
    const { ["type"]: e, ["offset"]: n = 0, ["child"]: s = new Me().visit({ type: e.childType }) } = t, r = O(t.nullBitmap), o = Ae(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, void 0, r], [s]);
  }
}
const Ya = new Me();
function D(i) {
  return Ya.visit(i);
}
class is {
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
function Yr(i) {
  return i.reduce((t, e) => t + e.nullCount, 0);
}
function Wr(i) {
  return i.reduce((t, e, n) => (t[n + 1] = t[n] + e.length, t), new Uint32Array(i.length + 1));
}
function Gr(i, t, e, n) {
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
function In(i, t, e, n) {
  let s = 0, r = 0, o = t.length - 1;
  do {
    if (s >= o - 1)
      return e < t[o] ? n(i, s, e - t[s]) : null;
    r = s + Math.trunc((o - s) * 0.5), e < t[r] ? o = r : s = r;
  } while (s < o);
}
function Sn(i, t) {
  return i.getValid(t);
}
function Oi(i) {
  function t(e, n, s) {
    return i(e[n], s);
  }
  return function(e) {
    const n = this.data;
    return In(n, this._offsets, e, t);
  };
}
function Hr(i) {
  let t;
  function e(n, s, r) {
    return i(n[s], r, t);
  }
  return function(n, s) {
    const r = this.data;
    t = s;
    const o = In(r, this._offsets, n, e);
    return t = void 0, o;
  };
}
function qr(i) {
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
    const r = this.data, o = typeof s != "number" ? e(r, 0, 0) : In(r, this._offsets, s, e);
    return t = void 0, o;
  };
}
class p extends A {
}
function Ga(i, t) {
  return t === null && i.length > 0 ? 0 : -1;
}
function Ha(i, t) {
  const { nullBitmap: e } = i;
  if (!e || i.nullCount <= 0)
    return -1;
  let n = 0;
  for (const s of new vn(e, i.offset + (t || 0), i.length, e, $r)) {
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
  const n = ot.getVisitFn(i), s = Be(t);
  for (let r = (e || 0) - 1, o = i.length; ++r < o; )
    if (s(n(i, r)))
      return r;
  return -1;
}
function Kr(i, t, e) {
  const n = ot.getVisitFn(i), s = Be(t);
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
p.prototype.visitDenseUnion = Kr;
p.prototype.visitSparseUnion = Kr;
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
const Ei = new p();
class m extends A {
}
function v(i) {
  const { type: t } = i;
  if (i.nullCount === 0 && i.stride === 1 && // Don't defer to native iterator for timestamps since Numbers are expected
  // (DataType.isTimestamp(type)) && type.unit === TimeUnit.MILLISECOND ||
  (f.isInt(t) && t.bitWidth !== 64 || f.isTime(t) && t.bitWidth !== 64 || f.isFloat(t) && t.precision !== K.HALF))
    return new is(i.data.length, (n) => {
      const s = i.data[n];
      return s.values.subarray(0, s.length)[Symbol.iterator]();
    });
  let e = 0;
  return new is(i.data.length, (n) => {
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
const Bn = new m();
var Jr;
const Qr = {}, Zr = {};
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
        const { get: a, set: c, indexOf: u } = Qr[o.typeId], d = r[0];
        this.isValid = (h) => Sn(d, h), this.get = (h) => a(d, h), this.set = (h, j) => c(d, h, j), this.indexOf = (h) => u(d, h), this._offsets = [0, d.length];
        break;
      }
      default:
        Object.setPrototypeOf(this, Zr[o.typeId]), this._offsets = Wr(r);
        break;
    }
    this.data = r, this.type = o, this.stride = Ut(o), this.numChildren = (s = (n = o.children) === null || n === void 0 ? void 0 : n.length) !== null && s !== void 0 ? s : 0, this.length = this._offsets.at(-1);
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
    return Yr(this.data);
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
    return this.get(wn(t, this.length));
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
    return Bn.visit(this);
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
    return new R(jr(this, t, e, ({ data: n, _offsets: s }, r, o) => Gr(n, s, r, o)));
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
      const t = new Ni(this.data[0].dictionary), e = this.data.map((n) => {
        const s = n.clone();
        return s.dictionary = t, s;
      });
      return new R(e);
    }
    return new Ni(this);
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
    const n = ot.getVisitFnByTypeId(e), s = mt.getVisitFnByTypeId(e), r = Ei.getVisitFnByTypeId(e);
    Qr[e] = { get: n, set: s, indexOf: r }, Zr[e] = Object.create(i, {
      isValid: { value: Oi(Sn) },
      get: { value: Oi(ot.getVisitFnByTypeId(e)) },
      set: { value: Hr(mt.getVisitFnByTypeId(e)) },
      indexOf: { value: qr(Ei.getVisitFnByTypeId(e)) }
    });
  }
  return "Vector";
})(R.prototype);
class Ni extends R {
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
      value: (o, a) => new Ni(s.call(this, o, a))
    }), Object.defineProperty(this, "isMemoized", { value: !0 }), Object.defineProperty(this, "unmemoize", {
      value: () => new R(this.data)
    }), Object.defineProperty(this, "memoize", {
      value: () => this
    });
  }
}
class an {
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
    return e ? (t || new vt()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
  }
  dictionaries(t, e) {
    const n = this.bb.__offset(this.bb_pos, 8);
    return n ? (e || new an()).__init(this.bb.__vector(this.bb_pos + n) + t * 24, this.bb) : null;
  }
  dictionariesLength() {
    const t = this.bb.__offset(this.bb_pos, 8);
    return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
  }
  recordBatches(t, e) {
    const n = this.bb.__offset(this.bb_pos, 10);
    return n ? (e || new an()).__init(this.bb.__vector(this.bb_pos + n) + t * 24, this.bb) : null;
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
    this.fields = t || [], this.metadata = e || /* @__PURE__ */ new Map(), n || (n = cn(this.fields)), this.dictionaries = n, this.metadataVersion = s;
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
    const e = t[0] instanceof L ? t[0] : Array.isArray(t[0]) ? new L(t[0]) : new L(t), n = [...this.fields], s = Ke(Ke(/* @__PURE__ */ new Map(), this.metadata), e.metadata), r = e.fields.filter((a) => {
      const c = n.findIndex((u) => u.name === a.name);
      return ~c ? (n[c] = a.clone({
        metadata: Ke(Ke(/* @__PURE__ */ new Map(), n[c].metadata), a.metadata)
      })) && !1 : !0;
    }), o = cn(r, /* @__PURE__ */ new Map());
    return new L([...n, ...r], s, new Map([...this.dictionaries, ...o]));
  }
}
L.prototype.fields = null;
L.prototype.metadata = null;
L.prototype.dictionaries = null;
class V {
  /** @nocollapse */
  static new(...t) {
    let [e, n, s, r] = t;
    return t[0] && typeof t[0] == "object" && ({ name: e } = t[0], n === void 0 && (n = t[0].type), s === void 0 && (s = t[0].nullable), r === void 0 && (r = t[0].metadata)), new V(`${e}`, n, s, r);
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
    return !t[0] || typeof t[0] != "object" ? [e = this.name, n = this.type, s = this.nullable, r = this.metadata] = t : { name: e = this.name, type: n = this.type, nullable: s = this.nullable, metadata: r = this.metadata } = t[0], V.new(e, n, s, r);
  }
}
V.prototype.type = null;
V.prototype.name = null;
V.prototype.nullable = null;
V.prototype.metadata = null;
function Ke(i, t) {
  return new Map([...i || /* @__PURE__ */ new Map(), ...t || /* @__PURE__ */ new Map()]);
}
function cn(i, t = /* @__PURE__ */ new Map()) {
  for (let e = -1, n = i.length; ++e < n; ) {
    const r = i[e].type;
    if (f.isDictionary(r)) {
      if (!t.has(r.id))
        t.set(r.id, r.dictionary);
      else if (t.get(r.id) !== r.dictionary)
        throw new Error("Cannot create Schema containing two different dictionaries with the same Id");
    }
    r.children && r.children.length > 0 && cn(r.children, t);
  }
  return t;
}
var Ka = Is, Ja = ge;
class ze {
  /** @nocollapse */
  static decode(t) {
    t = new Ja(O(t));
    const e = at.getRootAsFooter(t), n = L.decode(e.schema(), /* @__PURE__ */ new Map(), e.version());
    return new Qa(n, e);
  }
  /** @nocollapse */
  static encode(t) {
    const e = new Ka(), n = L.encode(e, t.schema);
    at.startRecordBatchesVector(e, t.numRecordBatches);
    for (const o of [...t.recordBatches()].slice().reverse())
      Gt.encode(e, o);
    const s = e.endVector();
    at.startDictionariesVector(e, t.numDictionaries);
    for (const o of [...t.dictionaryBatches()].slice().reverse())
      Gt.encode(e, o);
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
class Qa extends ze {
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
        return Gt.decode(e);
    }
    return null;
  }
  getDictionaryBatch(t) {
    if (t >= 0 && t < this.numDictionaries) {
      const e = this._footer.dictionaries(t);
      if (e)
        return Gt.decode(e);
    }
    return null;
  }
}
class Gt {
  /** @nocollapse */
  static decode(t) {
    return new Gt(t.metaDataLength(), t.bodyLength(), t.offset());
  }
  /** @nocollapse */
  static encode(t, e) {
    const { metaDataLength: n } = e, s = BigInt(e.offset), r = BigInt(e.bodyLength);
    return an.createBlock(t, s, n, r);
  }
  constructor(t, e, n) {
    this.metaDataLength = t, this.offset = x(n), this.bodyLength = x(e);
  }
}
const Y = Object.freeze({ done: !0, value: void 0 });
class ns {
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
        t.shift().resolve(Y);
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
      return yield this.abort(t), Y;
    });
  }
  return(t) {
    return B(this, void 0, void 0, function* () {
      return yield this.close(), Y;
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
    }) : Promise.resolve(Y);
  }
  _ensureOpen() {
    if (this._closedPromiseResolve)
      return !0;
    throw new Error("AsyncQueue is closed");
  }
}
class ni extends Za {
  write(t) {
    if ((t = O(t)).byteLength > 0)
      return super.write(t);
  }
  toString(t = !1) {
    return t ? Zi(this.toUint8Array(!0)) : this.toUint8Array(!1).then(Zi);
  }
  toUint8Array(t = !1) {
    return t ? Ft(this._values)[0] : B(this, void 0, void 0, function* () {
      var e, n, s, r;
      const o = [];
      let a = 0;
      try {
        for (var c = !0, u = Zt(this), d; d = yield u.next(), e = d.done, !e; c = !0) {
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
      return Ft(o, a)[0];
    });
  }
}
class Ri {
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
class ve {
  constructor(t) {
    t instanceof ve ? this.source = t.source : t instanceof ni ? this.source = new Jt(dt.fromAsyncIterable(t)) : gs(t) ? this.source = new Jt(dt.fromNodeStream(t)) : yn(t) ? this.source = new Jt(dt.fromDOMStream(t)) : _s(t) ? this.source = new Jt(dt.fromDOMStream(t.body)) : je(t) ? this.source = new Jt(dt.fromIterable(t)) : Xt(t) ? this.source = new Jt(dt.fromAsyncIterable(t)) : Se(t) && (this.source = new Jt(dt.fromAsyncIterable(t)));
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
    return Object.create(this.source.throw && this.source.throw(t) || Y);
  }
  return(t) {
    return Object.create(this.source.return && this.source.return(t) || Y);
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
      const e = this.source.throw && (yield this.source.throw(t)) || Y;
      return this._closedPromiseResolve && this._closedPromiseResolve(), this._closedPromiseResolve = void 0, Object.create(e);
    });
  }
  return(t) {
    return B(this, void 0, void 0, function* () {
      const e = this.source.return && (yield this.source.return(t)) || Y;
      return this._closedPromiseResolve && this._closedPromiseResolve(), this._closedPromiseResolve = void 0, Object.create(e);
    });
  }
}
class ss extends Ri {
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
class Li extends ve {
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
function fe(i) {
  return i < 0 && (i = 4294967295 + i + 1), `0x${i.toString(16)}`;
}
const Ie = 8, An = [
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
class Xr {
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
    return `${fe(this.buffer[1])} ${fe(this.buffer[0])}`;
  }
}
class C extends Xr {
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
      const o = Ie < n - r ? Ie : n - r, a = new C(new Uint32Array([Number.parseInt(t.slice(r, r + o), 10), 0])), c = new C(new Uint32Array([An[o], 0]));
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
class it extends Xr {
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
      const a = Ie < s - o ? Ie : s - o, c = new it(new Uint32Array([Number.parseInt(t.slice(o, o + a), 10), 0])), u = new it(new Uint32Array([An[a], 0]));
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
class It {
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
    return `${fe(this.buffer[3])} ${fe(this.buffer[2])} ${fe(this.buffer[1])} ${fe(this.buffer[0])}`;
  }
  /** @nocollapse */
  static multiply(t, e) {
    return new It(new Uint32Array(t.buffer)).times(e);
  }
  /** @nocollapse */
  static add(t, e) {
    return new It(new Uint32Array(t.buffer)).plus(e);
  }
  /** @nocollapse */
  static from(t, e = new Uint32Array(4)) {
    return It.fromString(typeof t == "string" ? t : t.toString(), e);
  }
  /** @nocollapse */
  static fromNumber(t, e = new Uint32Array(4)) {
    return It.fromString(t.toString(), e);
  }
  /** @nocollapse */
  static fromString(t, e = new Uint32Array(4)) {
    const n = t.startsWith("-"), s = t.length, r = new It(e);
    for (let o = n ? 1 : 0; o < s; ) {
      const a = Ie < s - o ? Ie : s - o, c = new It(new Uint32Array([Number.parseInt(t.slice(o, o + a), 10), 0, 0, 0])), u = new It(new Uint32Array([An[a], 0, 0, 0]));
      r.times(u), r.plus(c), o += a;
    }
    return n ? r.negate() : r;
  }
  /** @nocollapse */
  static convertArray(t) {
    const e = new Uint32Array(t.length * 4);
    for (let n = -1, s = t.length; ++n < s; )
      It.from(t[n], new Uint32Array(e.buffer, e.byteOffset + 16 * n, 4));
    return e;
  }
}
class to extends A {
  constructor(t, e, n, s, r = G.V5) {
    super(), this.nodesIndex = -1, this.buffersIndex = -1, this.bytes = t, this.nodes = e, this.buffers = n, this.dictionaries = s, this.metadataVersion = r;
  }
  visit(t) {
    return super.visit(t instanceof V ? t.type : t);
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
class ec extends to {
  constructor(t, e, n, s, r) {
    super(new Uint8Array(0), e, n, s, r), this.sources = t;
  }
  readNullBitmap(t, e, { offset: n } = this.nextBufferRange()) {
    return e <= 0 ? new Uint8Array(0) : Fi(this.sources[n]);
  }
  readOffsets(t, { offset: e } = this.nextBufferRange()) {
    return P(Uint8Array, P(t.OffsetArrayType, this.sources[e]));
  }
  readTypeIds(t, { offset: e } = this.nextBufferRange()) {
    return P(Uint8Array, P(t.ArrayType, this.sources[e]));
  }
  readData(t, { offset: e } = this.nextBufferRange()) {
    const { sources: n } = this;
    return f.isTimestamp(t) || (f.isInt(t) || f.isTime(t)) && t.bitWidth === 64 || f.isDuration(t) || f.isDate(t) && t.unit === pt.MILLISECOND ? P(Uint8Array, it.convertArray(n[e])) : f.isDecimal(t) ? P(Uint8Array, It.convertArray(n[e])) : f.isBinary(t) || f.isLargeBinary(t) || f.isFixedSizeBinary(t) ? ic(n[e]) : f.isBool(t) ? Fi(n[e]) : f.isUtf8(t) || f.isLargeUtf8(t) ? fn(n[e].join("")) : P(Uint8Array, P(t.ArrayType, n[e].map((s) => +s)));
  }
}
function ic(i) {
  const t = i.join(""), e = new Uint8Array(t.length / 2);
  for (let n = 0; n < t.length; n += 2)
    e[n >> 1] = Number.parseInt(t.slice(n, n + 2), 16);
  return e;
}
class _ extends A {
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
function ee(i, t) {
  return i === t || et(i, t);
}
function kt(i, t) {
  return i === t || et(i, t) && i.bitWidth === t.bitWidth && i.isSigned === t.isSigned;
}
function zi(i, t) {
  return i === t || et(i, t) && i.precision === t.precision;
}
function nc(i, t) {
  return i === t || et(i, t) && i.byteWidth === t.byteWidth;
}
function Dn(i, t) {
  return i === t || et(i, t) && i.unit === t.unit;
}
function $e(i, t) {
  return i === t || et(i, t) && i.unit === t.unit && i.timezone === t.timezone;
}
function Ye(i, t) {
  return i === t || et(i, t) && i.unit === t.unit && i.bitWidth === t.bitWidth;
}
function sc(i, t) {
  return i === t || et(i, t) && i.children.length === t.children.length && Ht.compareManyFields(i.children, t.children);
}
function rc(i, t) {
  return i === t || et(i, t) && i.children.length === t.children.length && Ht.compareManyFields(i.children, t.children);
}
function Fn(i, t) {
  return i === t || et(i, t) && i.mode === t.mode && i.typeIds.every((e, n) => e === t.typeIds[n]) && Ht.compareManyFields(i.children, t.children);
}
function oc(i, t) {
  return i === t || et(i, t) && i.id === t.id && i.isOrdered === t.isOrdered && Ht.visit(i.indices, t.indices) && Ht.visit(i.dictionary, t.dictionary);
}
function On(i, t) {
  return i === t || et(i, t) && i.unit === t.unit;
}
function We(i, t) {
  return i === t || et(i, t) && i.unit === t.unit;
}
function ac(i, t) {
  return i === t || et(i, t) && i.listSize === t.listSize && i.children.length === t.children.length && Ht.compareManyFields(i.children, t.children);
}
function cc(i, t) {
  return i === t || et(i, t) && i.keysSorted === t.keysSorted && i.children.length === t.children.length && Ht.compareManyFields(i.children, t.children);
}
_.prototype.visitNull = ee;
_.prototype.visitBool = ee;
_.prototype.visitInt = kt;
_.prototype.visitInt8 = kt;
_.prototype.visitInt16 = kt;
_.prototype.visitInt32 = kt;
_.prototype.visitInt64 = kt;
_.prototype.visitUint8 = kt;
_.prototype.visitUint16 = kt;
_.prototype.visitUint32 = kt;
_.prototype.visitUint64 = kt;
_.prototype.visitFloat = zi;
_.prototype.visitFloat16 = zi;
_.prototype.visitFloat32 = zi;
_.prototype.visitFloat64 = zi;
_.prototype.visitUtf8 = ee;
_.prototype.visitLargeUtf8 = ee;
_.prototype.visitBinary = ee;
_.prototype.visitLargeBinary = ee;
_.prototype.visitFixedSizeBinary = nc;
_.prototype.visitDate = Dn;
_.prototype.visitDateDay = Dn;
_.prototype.visitDateMillisecond = Dn;
_.prototype.visitTimestamp = $e;
_.prototype.visitTimestampSecond = $e;
_.prototype.visitTimestampMillisecond = $e;
_.prototype.visitTimestampMicrosecond = $e;
_.prototype.visitTimestampNanosecond = $e;
_.prototype.visitTime = Ye;
_.prototype.visitTimeSecond = Ye;
_.prototype.visitTimeMillisecond = Ye;
_.prototype.visitTimeMicrosecond = Ye;
_.prototype.visitTimeNanosecond = Ye;
_.prototype.visitDecimal = ee;
_.prototype.visitList = sc;
_.prototype.visitStruct = rc;
_.prototype.visitUnion = Fn;
_.prototype.visitDenseUnion = Fn;
_.prototype.visitSparseUnion = Fn;
_.prototype.visitDictionary = oc;
_.prototype.visitInterval = On;
_.prototype.visitIntervalDayTime = On;
_.prototype.visitIntervalYearMonth = On;
_.prototype.visitDuration = We;
_.prototype.visitDurationSecond = We;
_.prototype.visitDurationMillisecond = We;
_.prototype.visitDurationMicrosecond = We;
_.prototype.visitDurationNanosecond = We;
_.prototype.visitFixedSizeList = ac;
_.prototype.visitMap = cc;
const Ht = new _();
function ln(i, t) {
  return Ht.compareSchemas(i, t);
}
function Hi(i, t) {
  return lc(i, t.map((e) => e.data.concat()));
}
function lc(i, t) {
  const e = [...i.fields], n = [], s = { numBatches: t.reduce((h, j) => Math.max(h, j.length), 0) };
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
var eo;
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
            const u = Object.keys(c), d = u.map((F) => new R([c[F]])), h = s ?? new L(u.map((F, k) => new V(String(F), d[k].type, d[k].nullable))), [, j] = Hi(h, d);
            return j.length === 0 ? [new st(c)] : j;
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
      if (!ln(s, c.schema))
        throw new TypeError("Table and inner RecordBatch schemas must be equivalent.");
    }
    this.schema = s, this.batches = a, this._offsets = r ?? Wr(this.data);
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
    return this._nullCount === -1 && (this._nullCount = Yr(this.data)), this._nullCount;
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
    return this.get(wn(t, this.numRows));
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
    return this.batches.length > 0 ? Bn.visit(new R(this.data)) : new Array(0)[Symbol.iterator]();
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
    [t, e] = jr({ length: this.numRows }, t, e);
    const s = Gr(this.data, this._offsets, t, e);
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
      e || (e = new R([D({ type: new Wt(), length: this.numRows })]));
      const r = n.fields.slice(), o = r[t].clone({ type: e.type }), a = this.schema.fields.map((c, u) => this.getChildAt(u));
      [r[t], a[t]] = [o, e], [n, s] = Hi(n, a);
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
      const [d, h] = a, j = e.findIndex((F) => F.name === c.name);
      return ~j ? h[j] = u : d.push(u), a;
    }, [[], []]), r = this.schema.assign(t.schema), o = [
      ...e.map((a, c) => [c, s[c]]).map(([a, c]) => c === void 0 ? this.getChildAt(a) : t.getChildAt(c)),
      ...n.map((a) => t.getChildAt(a))
    ].filter(Boolean);
    return new Z(...Hi(r, o));
  }
}
eo = Symbol.toStringTag;
Z[eo] = ((i) => (i.schema = null, i.batches = [], i._offsets = new Uint32Array([0]), i._nullCount = -1, i[Symbol.isConcatSpreadable] = !0, i.isValid = Oi(Sn), i.get = Oi(ot.getVisitFn(l.Struct)), i.set = Hr(mt.getVisitFn(l.Struct)), i.indexOf = qr(Ei.getVisitFn(l.Struct)), "Table"))(Z.prototype);
var io;
let st = class Ue {
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
        [this.schema, this.data] = rs(this.schema, this.data.children);
        break;
      }
      case 1: {
        const [e] = t, { fields: n, children: s, length: r } = Object.keys(e).reduce((c, u, d) => (c.children[d] = e[u], c.length = Math.max(c.length, e[u].length), c.fields[d] = V.new({ name: u, type: e[u].type, nullable: !0 }), c), {
          length: 0,
          fields: new Array(),
          children: new Array()
        }), o = new L(n), a = D({ type: new X(n), length: r, children: s, nullCount: 0 });
        [this.schema, this.data] = rs(o, a.children, r);
        break;
      }
      default:
        throw new TypeError("RecordBatch constructor expects an Object mapping names to child Data, or a [Schema, Data] pair.");
    }
  }
  get dictionaries() {
    return this._dictionaries || (this._dictionaries = no(this.schema.fields, this.data.children));
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
    return this.get(wn(t, this.numRows));
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
    return Ei.visit(this.data, t, e);
  }
  /**
   * Iterator for rows in this RecordBatch.
   */
  [Symbol.iterator]() {
    return Bn.visit(new R([this.data]));
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
    return new Ue(this.schema, n);
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
      e || (e = new R([D({ type: new Wt(), length: this.numRows })]));
      const r = n.fields.slice(), o = s.children.slice(), a = r[t].clone({ type: e.type });
      [r[t], o[t]] = [a, e.data[0]], n = new L(r, new Map(this.schema.metadata)), s = D({ type: new X(r), children: o });
    }
    return new Ue(n, s);
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
    return new Ue(e, D({ type: n, length: this.numRows, children: s }));
  }
  /**
   * Construct a new RecordBatch containing only columns at the specified indices.
   *
   * @param columnIndices Indices of columns to keep.
   * @returns A new RecordBatch of columns matching at the specified indices.
   */
  selectAt(t) {
    const e = this.schema.selectAt(t), n = t.map((r) => this.data.children[r]).filter(Boolean), s = D({ type: new X(e.fields), length: this.numRows, children: n });
    return new Ue(e, s);
  }
};
io = Symbol.toStringTag;
st[io] = ((i) => (i._nullCount = -1, i[Symbol.isConcatSpreadable] = !0, "RecordBatch"))(st.prototype);
function rs(i, t, e = t.reduce((n, s) => Math.max(n, s.length), 0)) {
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
function no(i, t, e = /* @__PURE__ */ new Map()) {
  var n, s;
  if (((n = i?.length) !== null && n !== void 0 ? n : 0) > 0 && i?.length === t?.length)
    for (let r = -1, o = i.length; ++r < o; ) {
      const { type: a } = i[r], c = t[r];
      for (const u of [c, ...((s = c?.dictionary) === null || s === void 0 ? void 0 : s.data) || []])
        no(a.children, u?.children, e);
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
class En extends st {
  constructor(t) {
    const e = t.fields.map((s) => D({ type: s.type })), n = D({ type: new X(t.fields), nullCount: 0, children: e });
    super(t, n);
  }
}
let Vt = class wt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsMessage(t, e) {
    return (e || new wt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsMessage(t, e) {
    return t.setPosition(t.position() + U), (e || new wt()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return wt.startMessage(t), wt.addVersion(t, e), wt.addHeaderType(t, n), wt.addHeader(t, s), wt.addBodyLength(t, r), wt.addCustomMetadata(t, o), wt.endMessage(t);
  }
};
class dc extends A {
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
    return Bt.startFloatingPoint(e), Bt.addPrecision(e, t.precision), Bt.endFloatingPoint(e);
  }
  visitBinary(t, e) {
    return Wn.startBinary(e), Wn.endBinary(e);
  }
  visitLargeBinary(t, e) {
    return Hn.startLargeBinary(e), Hn.endLargeBinary(e);
  }
  visitBool(t, e) {
    return Gn.startBool(e), Gn.endBool(e);
  }
  visitUtf8(t, e) {
    return Qn.startUtf8(e), Qn.endUtf8(e);
  }
  visitLargeUtf8(t, e) {
    return qn.startLargeUtf8(e), qn.endLargeUtf8(e);
  }
  visitDecimal(t, e) {
    return re.startDecimal(e), re.addScale(e, t.scale), re.addPrecision(e, t.precision), re.addBitWidth(e, t.bitWidth), re.endDecimal(e);
  }
  visitDate(t, e) {
    return Qe.startDate(e), Qe.addUnit(e, t.unit), Qe.endDate(e);
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
    return Ze.startDuration(e), Ze.addUnit(e, t.unit), Ze.endDuration(e);
  }
  visitList(t, e) {
    return Kn.startList(e), Kn.endList(e);
  }
  visitStruct(t, e) {
    return Qt.startStruct_(e), Qt.endStruct_(e);
  }
  visitUnion(t, e) {
    nt.startTypeIdsVector(e, t.typeIds.length);
    const n = nt.createTypeIdsVector(e, t.typeIds);
    return nt.startUnion(e), nt.addMode(e, t.mode), nt.addTypeIds(e, n), nt.endUnion(e);
  }
  visitDictionary(t, e) {
    const n = this.visit(t.indices, e);
    return Ct.startDictionaryEncoding(e), Ct.addId(e, BigInt(t.id)), Ct.addIsOrdered(e, t.isOrdered), n !== void 0 && Ct.addIndexType(e, n), Ct.endDictionaryEncoding(e);
  }
  visitFixedSizeBinary(t, e) {
    return Xe.startFixedSizeBinary(e), Xe.addByteWidth(e, t.byteWidth), Xe.endFixedSizeBinary(e);
  }
  visitFixedSizeList(t, e) {
    return ti.startFixedSizeList(e), ti.addListSize(e, t.listSize), ti.endFixedSizeList(e);
  }
  visitMap(t, e) {
    return ei.startMap(e), ei.addKeysSorted(e, t.keysSorted), ei.endMap(e);
  }
}
const qi = new dc();
function hc(i, t = /* @__PURE__ */ new Map()) {
  return new L(yc(i, t), si(i.metadata), t);
}
function so(i) {
  return new lt(i.count, ro(i.columns), oo(i.columns));
}
function fc(i) {
  return new Et(so(i.data), i.id, i.isDelta);
}
function yc(i, t) {
  return (i.fields || []).filter(Boolean).map((e) => V.fromJSON(e, t));
}
function os(i, t) {
  return (i.children || []).filter(Boolean).map((e) => V.fromJSON(e, t));
}
function ro(i) {
  return (i || []).reduce((t, e) => [
    ...t,
    new qt(e.count, pc(e.VALIDITY)),
    ...ro(e.children)
  ], []);
}
function oo(i, t = []) {
  for (let e = -1, n = (i || []).length; ++e < n; ) {
    const s = i[e];
    s.VALIDITY && t.push(new Dt(t.length, s.VALIDITY.length)), s.TYPE_ID && t.push(new Dt(t.length, s.TYPE_ID.length)), s.OFFSET && t.push(new Dt(t.length, s.OFFSET.length)), s.DATA && t.push(new Dt(t.length, s.DATA.length)), t = oo(s.children, t);
  }
  return t;
}
function pc(i) {
  return (i || []).reduce((t, e) => t + +(e === 0), 0);
}
function mc(i, t) {
  let e, n, s, r, o, a;
  return !t || !(r = i.dictionary) ? (o = cs(i, os(i, t)), s = new V(i.name, o, i.nullable, si(i.metadata))) : t.has(e = r.id) ? (n = (n = r.indexType) ? as(n) : new xe(), a = new we(t.get(e), n, e, r.isOrdered), s = new V(i.name, a, i.nullable, si(i.metadata))) : (n = (n = r.indexType) ? as(n) : new xe(), t.set(e, o = cs(i, os(i, t))), a = new we(o, n, e, r.isOrdered), s = new V(i.name, a, i.nullable, si(i.metadata))), s || null;
}
function si(i = []) {
  return new Map(i.map(({ key: t, value: e }) => [t, e]));
}
function as(i) {
  return new te(i.isSigned, i.bitWidth);
}
function cs(i, t) {
  const e = i.type.name;
  switch (e) {
    case "NONE":
      return new Wt();
    case "null":
      return new Wt();
    case "binary":
      return new di();
    case "largebinary":
      return new hi();
    case "utf8":
      return new fi();
    case "largeutf8":
      return new yi();
    case "bool":
      return new pi();
    case "list":
      return new Ii((t || [])[0]);
    case "struct":
      return new X(t || []);
    case "struct_":
      return new X(t || []);
  }
  switch (e) {
    case "int": {
      const n = i.type;
      return new te(n.isSigned, n.bitWidth);
    }
    case "floatingpoint": {
      const n = i.type;
      return new ui(K[n.precision]);
    }
    case "decimal": {
      const n = i.type;
      return new mi(n.scale, n.precision, n.bitWidth);
    }
    case "date": {
      const n = i.type;
      return new _i(pt[n.unit]);
    }
    case "time": {
      const n = i.type;
      return new gi(g[n.unit], n.bitWidth);
    }
    case "timestamp": {
      const n = i.type;
      return new bi(g[n.unit], n.timezone);
    }
    case "interval": {
      const n = i.type;
      return new wi(Ot[n.unit]);
    }
    case "duration": {
      const n = i.type;
      return new vi(g[n.unit]);
    }
    case "union": {
      const n = i.type, [s, ...r] = (n.mode + "").toLowerCase(), o = s.toUpperCase() + r.join("");
      return new Si(J[o], n.typeIds || [], t || []);
    }
    case "fixedsizebinary": {
      const n = i.type;
      return new Bi(n.byteWidth);
    }
    case "fixedsizelist": {
      const n = i.type;
      return new Ti(n.listSize, (t || [])[0]);
    }
    case "map": {
      const n = i.type;
      return new Ai((t || [])[0], n.keysSorted);
    }
  }
  throw new Error(`Unrecognized type: "${e}"`);
}
var _c = Is, gc = ge;
class tt {
  /** @nocollapse */
  static fromJSON(t, e) {
    const n = new tt(0, G.V5, e);
    return n._createHeader = bc(t, e), n;
  }
  /** @nocollapse */
  static decode(t) {
    t = new gc(O(t));
    const e = Vt.getRootAsMessage(t), n = e.bodyLength(), s = e.version(), r = e.headerType(), o = new tt(n, s, r);
    return o._createHeader = wc(e, r), o;
  }
  /** @nocollapse */
  static encode(t) {
    const e = new _c();
    let n = -1;
    return t.isSchema() ? n = L.encode(e, t.header()) : t.isRecordBatch() ? n = lt.encode(e, t.header()) : t.isDictionaryBatch() && (n = Et.encode(e, t.header())), Vt.startMessage(e), Vt.addVersion(e, G.V5), Vt.addHeader(e, n), Vt.addHeaderType(e, t.headerType), Vt.addBodyLength(e, BigInt(t.bodyLength)), Vt.finishMessageBuffer(e, Vt.endMessage(e)), e.asUint8Array();
  }
  /** @nocollapse */
  static from(t, e = 0) {
    if (t instanceof L)
      return new tt(0, G.V5, N.Schema, t);
    if (t instanceof lt)
      return new tt(e, G.V5, N.RecordBatch, t);
    if (t instanceof Et)
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
    this._version = e, this._headerType = n, this.body = new Uint8Array(0), s && (this._createHeader = () => s), this._bodyLength = x(t);
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
    this._nodes = e, this._buffers = n, this._length = x(t);
  }
}
class Et {
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
    this._data = t, this._isDelta = n, this._id = x(e);
  }
}
class Dt {
  constructor(t, e) {
    this.offset = x(t), this.length = x(e);
  }
}
class qt {
  constructor(t, e) {
    this.length = x(t), this.nullCount = x(e);
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
        return Et.fromJSON(i);
    }
    throw new Error(`Unrecognized Message type: { name: ${N[t]}, type: ${t} }`);
  });
}
function wc(i, t) {
  return (() => {
    switch (t) {
      case N.Schema:
        return L.decode(i.header(new vt()), /* @__PURE__ */ new Map(), i.version());
      case N.RecordBatch:
        return lt.decode(i.header(new Rt()), i.version());
      case N.DictionaryBatch:
        return Et.decode(i.header(new ne()), i.version());
    }
    throw new Error(`Unrecognized Message type: { name: ${N[t]}, type: ${t} }`);
  });
}
V.encode = Nc;
V.decode = Oc;
V.fromJSON = mc;
L.encode = Ec;
L.decode = vc;
L.fromJSON = hc;
lt.encode = Rc;
lt.decode = Ic;
lt.fromJSON = so;
Et.encode = Lc;
Et.decode = Sc;
Et.fromJSON = fc;
qt.encode = Uc;
qt.decode = Tc;
Dt.encode = Mc;
Dt.decode = Bc;
function vc(i, t = /* @__PURE__ */ new Map(), e = G.V5) {
  const n = Fc(i, t);
  return new L(n, ri(i), t, e);
}
function Ic(i, t = G.V5) {
  if (i.compression() !== null)
    throw new Error("Record batch compression not implemented");
  return new lt(i.length(), Ac(i), Dc(i, t));
}
function Sc(i, t = G.V5) {
  return new Et(lt.decode(i.data(), t), i.id(), i.isDelta());
}
function Bc(i) {
  return new Dt(i.offset(), i.length());
}
function Tc(i) {
  return new qt(i.length(), i.nullCount());
}
function Ac(i) {
  const t = [];
  for (let e, n = -1, s = -1, r = i.nodesLength(); ++n < r; )
    (e = i.nodes(n)) && (t[++s] = qt.decode(e));
  return t;
}
function Dc(i, t) {
  const e = [];
  for (let n, s = -1, r = -1, o = i.buffersLength(); ++s < o; )
    (n = i.buffers(s)) && (t < G.V4 && (n.bb_pos += 8 * (s + 1)), e[++r] = Dt.decode(n));
  return e;
}
function Fc(i, t) {
  const e = [];
  for (let n, s = -1, r = -1, o = i.fieldsLength(); ++s < o; )
    (n = i.fields(s)) && (e[++r] = V.decode(n, t));
  return e;
}
function ls(i, t) {
  const e = [];
  for (let n, s = -1, r = -1, o = i.childrenLength(); ++s < o; )
    (n = i.children(s)) && (e[++r] = V.decode(n, t));
  return e;
}
function Oc(i, t) {
  let e, n, s, r, o, a;
  return !t || !(a = i.dictionary()) ? (s = ds(i, ls(i, t)), n = new V(i.name(), s, i.nullable(), ri(i))) : t.has(e = x(a.id())) ? (r = (r = a.indexType()) ? us(r) : new xe(), o = new we(t.get(e), r, e, a.isOrdered()), n = new V(i.name(), o, i.nullable(), ri(i))) : (r = (r = a.indexType()) ? us(r) : new xe(), t.set(e, s = ds(i, ls(i, t))), o = new we(s, r, e, a.isOrdered()), n = new V(i.name(), o, i.nullable(), ri(i))), n || null;
}
function ri(i) {
  const t = /* @__PURE__ */ new Map();
  if (i)
    for (let e, n, s = -1, r = Math.trunc(i.customMetadataLength()); ++s < r; )
      (e = i.customMetadata(s)) && (n = e.key()) != null && t.set(n, e.value());
  return t;
}
function us(i) {
  return new te(i.isSigned(), i.bitWidth());
}
function ds(i, t) {
  const e = i.typeType();
  switch (e) {
    case z.NONE:
      return new Wt();
    case z.Null:
      return new Wt();
    case z.Binary:
      return new di();
    case z.LargeBinary:
      return new hi();
    case z.Utf8:
      return new fi();
    case z.LargeUtf8:
      return new yi();
    case z.Bool:
      return new pi();
    case z.List:
      return new Ii((t || [])[0]);
    case z.Struct_:
      return new X(t || []);
  }
  switch (e) {
    case z.Int: {
      const n = i.type(new ct());
      return new te(n.isSigned(), n.bitWidth());
    }
    case z.FloatingPoint: {
      const n = i.type(new Bt());
      return new ui(n.precision());
    }
    case z.Decimal: {
      const n = i.type(new re());
      return new mi(n.scale(), n.precision(), n.bitWidth());
    }
    case z.Date: {
      const n = i.type(new Qe());
      return new _i(n.unit());
    }
    case z.Time: {
      const n = i.type(new ht());
      return new gi(n.unit(), n.bitWidth());
    }
    case z.Timestamp: {
      const n = i.type(new ft());
      return new bi(n.unit(), n.timezone());
    }
    case z.Interval: {
      const n = i.type(new Tt());
      return new wi(n.unit());
    }
    case z.Duration: {
      const n = i.type(new Ze());
      return new vi(n.unit());
    }
    case z.Union: {
      const n = i.type(new nt());
      return new Si(n.mode(), n.typeIdsArray() || [], t || []);
    }
    case z.FixedSizeBinary: {
      const n = i.type(new Xe());
      return new Bi(n.byteWidth());
    }
    case z.FixedSizeList: {
      const n = i.type(new ti());
      return new Ti(n.listSize(), (t || [])[0]);
    }
    case z.Map: {
      const n = i.type(new ei());
      return new Ai((t || [])[0], n.keysSorted());
    }
  }
  throw new Error(`Unrecognized type: "${z[e]}" (${e})`);
}
function Ec(i, t) {
  const e = t.fields.map((r) => V.encode(i, r));
  vt.startFieldsVector(i, e.length);
  const n = vt.createFieldsVector(i, e), s = t.metadata && t.metadata.size > 0 ? vt.createCustomMetadataVector(i, [...t.metadata].map(([r, o]) => {
    const a = i.createString(`${r}`), c = i.createString(`${o}`);
    return q.startKeyValue(i), q.addKey(i, a), q.addValue(i, c), q.endKeyValue(i);
  })) : -1;
  return vt.startSchema(i), vt.addFields(i, n), vt.addEndianness(i, Cc ? be.Little : be.Big), s !== -1 && vt.addCustomMetadata(i, s), vt.endSchema(i);
}
function Nc(i, t) {
  let e = -1, n = -1, s = -1;
  const r = t.type;
  let o = t.typeId;
  f.isDictionary(r) ? (o = r.dictionary.typeId, s = qi.visit(r, i), n = qi.visit(r.dictionary, i)) : n = qi.visit(r, i);
  const a = (r.children || []).map((d) => V.encode(i, d)), c = ut.createChildrenVector(i, a), u = t.metadata && t.metadata.size > 0 ? ut.createCustomMetadataVector(i, [...t.metadata].map(([d, h]) => {
    const j = i.createString(`${d}`), F = i.createString(`${h}`);
    return q.startKeyValue(i), q.addKey(i, j), q.addValue(i, F), q.endKeyValue(i);
  })) : -1;
  return t.name && (e = i.createString(t.name)), ut.startField(i), ut.addType(i, n), ut.addTypeType(i, o), ut.addChildren(i, c), ut.addNullable(i, !!t.nullable), e !== -1 && ut.addName(i, e), s !== -1 && ut.addDictionary(i, s), u !== -1 && ut.addCustomMetadata(i, u), ut.endField(i);
}
function Rc(i, t) {
  const e = t.nodes || [], n = t.buffers || [];
  Rt.startNodesVector(i, e.length);
  for (const o of e.slice().reverse())
    qt.encode(i, o);
  const s = i.endVector();
  Rt.startBuffersVector(i, n.length);
  for (const o of n.slice().reverse())
    Dt.encode(i, o);
  const r = i.endVector();
  return Rt.startRecordBatch(i), Rt.addLength(i, BigInt(t.length)), Rt.addNodes(i, s), Rt.addBuffers(i, r), Rt.endRecordBatch(i);
}
function Lc(i, t) {
  const e = lt.encode(i, t.data);
  return ne.startDictionaryBatch(i), ne.addId(i, BigInt(t.id)), ne.addIsDelta(i, t.isDelta), ne.addData(i, e), ne.endDictionaryBatch(i);
}
function Uc(i, t) {
  return Ts.createFieldNode(i, BigInt(t.length), BigInt(t.nullCount));
}
function Mc(i, t) {
  return Bs.createBuffer(i, BigInt(t.offset), BigInt(t.length));
}
const Cc = (() => {
  const i = new ArrayBuffer(2);
  return new DataView(i).setInt16(
    0,
    256,
    !0
    /* littleEndian */
  ), new Int16Array(i)[0] === 256;
})(), Nn = (i) => `Expected ${N[i]} Message in stream, but was null or length 0.`, Rn = (i) => `Header pointer of flatbuffer-encoded ${N[i]} Message is null or length 0.`, ao = (i, t) => `Expected to read ${i} metadata bytes, but only read ${t}.`, co = (i, t) => `Expected to read ${i} bytes for message body, but only read ${t}.`;
class lo {
  constructor(t) {
    this.source = t instanceof Ri ? t : new Ri(t);
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    let t;
    return (t = this.readMetadataLength()).done || t.value === -1 && (t = this.readMetadataLength()).done || (t = this.readMetadata(t.value)).done ? Y : t;
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
      throw new Error(Nn(t));
    return e.value;
  }
  readMessageBody(t) {
    if (t <= 0)
      return new Uint8Array(0);
    const e = O(this.source.read(t));
    if (e.byteLength < t)
      throw new Error(co(t, e.byteLength));
    return (
      /* 1. */
      e.byteOffset % 8 === 0 && /* 2. */
      e.byteOffset + e.byteLength <= e.buffer.byteLength ? e : e.slice()
    );
  }
  readSchema(t = !1) {
    const e = N.Schema, n = this.readMessage(e), s = n?.header();
    if (t && !s)
      throw new Error(Rn(e));
    return s;
  }
  readMetadataLength() {
    const t = this.source.read(Vi), e = t && new ge(t), n = e?.readInt32(0) || 0;
    return { done: n === 0, value: n };
  }
  readMetadata(t) {
    const e = this.source.read(t);
    if (!e)
      return Y;
    if (e.byteLength < t)
      throw new Error(ao(t, e.byteLength));
    return { done: !1, value: tt.decode(e) };
  }
}
class Pc {
  constructor(t, e) {
    this.source = t instanceof ve ? t : ms(t) ? new Li(t, e) : new ve(t);
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  next() {
    return B(this, void 0, void 0, function* () {
      let t;
      return (t = yield this.readMetadataLength()).done || t.value === -1 && (t = yield this.readMetadataLength()).done || (t = yield this.readMetadata(t.value)).done ? Y : t;
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
        throw new Error(Nn(t));
      return e.value;
    });
  }
  readMessageBody(t) {
    return B(this, void 0, void 0, function* () {
      if (t <= 0)
        return new Uint8Array(0);
      const e = O(yield this.source.read(t));
      if (e.byteLength < t)
        throw new Error(co(t, e.byteLength));
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
        throw new Error(Rn(e));
      return s;
    });
  }
  readMetadataLength() {
    return B(this, void 0, void 0, function* () {
      const t = yield this.source.read(Vi), e = t && new ge(t), n = e?.readInt32(0) || 0;
      return { done: n === 0, value: n };
    });
  }
  readMetadata(t) {
    return B(this, void 0, void 0, function* () {
      const e = yield this.source.read(t);
      if (!e)
        return Y;
      if (e.byteLength < t)
        throw new Error(ao(t, e.byteLength));
      return { done: !1, value: tt.decode(e) };
    });
  }
}
class kc extends lo {
  constructor(t) {
    super(new Uint8Array(0)), this._schema = !1, this._body = [], this._batchIndex = 0, this._dictionaryIndex = 0, this._json = t instanceof ns ? t : new ns(t);
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
    return this._body = [], Y;
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
      throw new Error(Nn(t));
    return e.value;
  }
  readSchema() {
    const t = N.Schema, e = this.readMessage(t), n = e?.header();
    if (!e || !n)
      throw new Error(Rn(t));
    return n;
  }
}
const Vi = 4, un = "ARROW1", Ve = new Uint8Array(un.length);
for (let i = 0; i < un.length; i += 1)
  Ve[i] = un.codePointAt(i);
function Ln(i, t = 0) {
  for (let e = -1, n = Ve.length; ++e < n; )
    if (Ve[e] !== i[t + e])
      return !1;
  return !0;
}
const Ge = Ve.length, uo = Ge + Vi, xc = Ge * 2 + Vi;
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
    return Xt(e) ? e.then(() => this) : this;
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
    return t instanceof yt ? t : Xi(t) ? $c(t) : ms(t) ? Gc(t) : Xt(t) ? B(this, void 0, void 0, function* () {
      return yield yt.from(yield t);
    }) : _s(t) || yn(t) || gs(t) || Se(t) ? Wc(new ve(t)) : Yc(new Ri(t));
  }
  /** @nocollapse */
  static readAll(t) {
    return t instanceof yt ? t.isSync() ? hs(t) : fs(t) : Xi(t) || ArrayBuffer.isView(t) || je(t) || ps(t) ? hs(t) : fs(t);
  }
}
class Ui extends yt {
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
    return At(this, arguments, function* () {
      yield T(yield* Je(Zt(this[Symbol.iterator]())));
    });
  }
}
class Mi extends yt {
  constructor(t) {
    super(t), this._impl = t;
  }
  readAll() {
    return B(this, void 0, void 0, function* () {
      var t, e, n, s;
      const r = new Array();
      try {
        for (var o = !0, a = Zt(this), c; c = yield a.next(), t = c.done, !t; o = !0) {
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
class ho extends Ui {
  constructor(t) {
    super(t), this._impl = t;
  }
}
class zc extends Mi {
  constructor(t) {
    super(t), this._impl = t;
  }
}
class fo {
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
    return new to(e, t.nodes, t.buffers, this.dictionaries, this.schema.metadataVersion).visitMany(n);
  }
}
class Ci extends fo {
  constructor(t, e) {
    super(e), this._reader = Xi(t) ? new kc(this._handle = t) : new lo(this._handle = t);
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
    return this.closed || (this.autoDestroy = po(this, t), this.schema || (this.schema = this._reader.readSchema()) || this.cancel()), this;
  }
  throw(t) {
    return !this.closed && this.autoDestroy && (this.closed = !0) ? this.reset()._reader.throw(t) : Y;
  }
  return(t) {
    return !this.closed && this.autoDestroy && (this.closed = !0) ? this.reset()._reader.return(t) : Y;
  }
  next() {
    if (this.closed)
      return Y;
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
    return this.schema && this._recordBatchIndex === 0 ? (this._recordBatchIndex++, { done: !1, value: new En(this.schema) }) : this.return();
  }
  _readNextMessageAndValidate(t) {
    return this._reader.readMessage(t);
  }
}
class Pi extends fo {
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
      return this.closed || (this.autoDestroy = po(this, t), this.schema || (this.schema = yield this._reader.readSchema()) || (yield this.cancel())), this;
    });
  }
  throw(t) {
    return B(this, void 0, void 0, function* () {
      return !this.closed && this.autoDestroy && (this.closed = !0) ? yield this.reset()._reader.throw(t) : Y;
    });
  }
  return(t) {
    return B(this, void 0, void 0, function* () {
      return !this.closed && this.autoDestroy && (this.closed = !0) ? yield this.reset()._reader.return(t) : Y;
    });
  }
  next() {
    return B(this, void 0, void 0, function* () {
      if (this.closed)
        return Y;
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
      return this.schema && this._recordBatchIndex === 0 ? (this._recordBatchIndex++, { done: !1, value: new En(this.schema) }) : yield this.return();
    });
  }
  _readNextMessageAndValidate(t) {
    return B(this, void 0, void 0, function* () {
      return yield this._reader.readMessage(t);
    });
  }
}
class yo extends Ci {
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
    super(t instanceof ss ? t : new ss(t), e);
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
    const { _handle: t } = this, e = t.size - uo, n = t.readInt32(e), s = t.readAt(e - n, n);
    return ze.decode(s);
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
class Vc extends Pi {
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
    super(t instanceof Li ? t : new Li(t, n), s);
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
      const e = t.size - uo, n = yield t.readInt32(e), s = yield t.readAt(e - n, n);
      return ze.decode(s);
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
class jc extends Ci {
  constructor(t, e) {
    super(t, e);
  }
  _loadVectors(t, e, n) {
    return new ec(e, t.nodes, t.buffers, this.dictionaries, this.schema.metadataVersion).visitMany(n);
  }
}
function po(i, t) {
  return t && typeof t.autoDestroy == "boolean" ? t.autoDestroy : i.autoDestroy;
}
function* hs(i) {
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
function fs(i) {
  return At(this, arguments, function* () {
    const e = yield T(yt.from(i));
    try {
      if (!(yield T(e.open({ autoDestroy: !1 }))).closed)
        do
          yield yield T(e);
        while (!(yield T(e.reset().open())).closed);
    } finally {
      yield T(e.cancel());
    }
  });
}
function $c(i) {
  return new Ui(new jc(i));
}
function Yc(i) {
  const t = i.peek(Ge + 7 & -8);
  return t && t.byteLength >= 4 ? Ln(t) ? new ho(new yo(i.read())) : new Ui(new Ci(i)) : new Ui(new Ci((function* () {
  })()));
}
function Wc(i) {
  return B(this, void 0, void 0, function* () {
    const t = yield i.peek(Ge + 7 & -8);
    return t && t.byteLength >= 4 ? Ln(t) ? new ho(new yo(yield i.read())) : new Mi(new Pi(i)) : new Mi(new Pi((function() {
      return At(this, arguments, function* () {
      });
    })()));
  });
}
function Gc(i) {
  return B(this, void 0, void 0, function* () {
    const { size: t } = yield i.stat(), e = new Li(i, t);
    return t >= xc && Ln(yield e.readAt(0, Ge + 7 & -8)) ? new zc(new Vc(e)) : new Mi(new Pi(e));
  });
}
class W extends A {
  /** @nocollapse */
  static assemble(...t) {
    const e = (s) => s.flatMap((r) => Array.isArray(r) ? e(r) : r instanceof st ? r.data.children : r.data), n = new W();
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
        this.nodes.push(new qt(n, 0));
      else {
        const { nullCount: s } = t;
        f.isNull(e) || gt.call(this, s <= 0 ? new Uint8Array(0) : Di(t.offset, n, t.nullBitmap)), this.nodes.push(new qt(n, s));
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
  return this.buffers.push(i), this.bufferRegions.push(new Dt(this._byteLength, t)), this._byteLength += t, this;
}
function Hc(i) {
  var t;
  const { type: e, length: n, typeIds: s, valueOffsets: r } = i;
  if (gt.call(this, s), e.mode === J.Sparse)
    return dn.call(this, i);
  if (e.mode === J.Dense) {
    if (i.offset <= 0)
      return gt.call(this, r), dn.call(this, i);
    {
      const o = new Int32Array(n), a = /* @__PURE__ */ Object.create(null), c = /* @__PURE__ */ Object.create(null);
      for (let u, d, h = -1; ++h < n; )
        (u = s[h]) !== void 0 && ((d = a[u]) === void 0 && (d = a[u] = r[h]), o[h] = r[h] - d, c[u] = ((t = c[u]) !== null && t !== void 0 ? t : 0) + 1);
      gt.call(this, o), this.visitMany(i.children.map((u, d) => {
        const h = e.typeIds[d], j = a[h], F = c[h];
        return u.slice(j, Math.min(n, F));
      }));
    }
  }
  return this;
}
function qc(i) {
  let t;
  return i.nullCount >= i.length ? gt.call(this, new Uint8Array(0)) : (t = i.values) instanceof Uint8Array ? gt.call(this, Di(i.offset, i.length, t)) : gt.call(this, Fi(i.values));
}
function xt(i) {
  return gt.call(this, i.values.subarray(0, i.length * i.stride));
}
function ji(i) {
  const { length: t, values: e, valueOffsets: n } = i, s = x(n[0]), r = x(n[t]), o = Math.min(r - s, e.byteLength - s);
  return gt.call(this, ws(-s, t + 1, n)), gt.call(this, e.subarray(s, s + o)), this;
}
function Un(i) {
  const { length: t, valueOffsets: e } = i;
  if (e) {
    const { [0]: n, [t]: s } = e;
    return gt.call(this, ws(-n, t + 1, e)), this.visit(i.children[0].slice(n, s - n));
  }
  return this.visit(i.children[0]);
}
function dn(i) {
  return this.visitMany(i.type.children.map((t, e) => i.children[e]).filter(Boolean))[0];
}
W.prototype.visitBool = qc;
W.prototype.visitInt = xt;
W.prototype.visitFloat = xt;
W.prototype.visitUtf8 = ji;
W.prototype.visitLargeUtf8 = ji;
W.prototype.visitBinary = ji;
W.prototype.visitLargeBinary = ji;
W.prototype.visitFixedSizeBinary = xt;
W.prototype.visitDate = xt;
W.prototype.visitTimestamp = xt;
W.prototype.visitTime = xt;
W.prototype.visitDecimal = xt;
W.prototype.visitList = Un;
W.prototype.visitStruct = dn;
W.prototype.visitUnion = Hc;
W.prototype.visitInterval = xt;
W.prototype.visitDuration = xt;
W.prototype.visitFixedSizeList = Un;
W.prototype.visitMap = Un;
class mo extends Tn {
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
    super(), this._position = 0, this._started = !1, this._sink = new ni(), this._schema = null, this._dictionaryBlocks = [], this._recordBatchBlocks = [], this._seenDictionaries = /* @__PURE__ */ new Map(), this._dictionaryDeltaOffsets = /* @__PURE__ */ new Map(), rt(t) || (t = { autoDestroy: !0, writeLegacyIpcFormat: !1 }), this._autoDestroy = typeof t.autoDestroy == "boolean" ? t.autoDestroy : !0, this._writeLegacyIpcFormat = typeof t.writeLegacyIpcFormat == "boolean" ? t.writeLegacyIpcFormat : !1;
  }
  toString(t = !1) {
    return this._sink.toString(t);
  }
  toUint8Array(t = !1) {
    return this._sink.toUint8Array(t);
  }
  writeAll(t) {
    return Xt(t) ? t.then((e) => this.writeAll(e)) : Se(t) ? kn(this, t) : Pn(this, t);
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
    return t === this._sink || t instanceof ni ? this._sink = t : (this._sink = new ni(), t && To(t) ? this.toDOMStream({ type: "bytes" }).pipeTo(t) : t && Ao(t) && this.toNodeStream({ objectMode: !1 }).pipe(t)), this._started && this._schema && this._writeFooter(this._schema), this._started = !1, this._dictionaryBlocks = [], this._recordBatchBlocks = [], this._seenDictionaries = /* @__PURE__ */ new Map(), this._dictionaryDeltaOffsets = /* @__PURE__ */ new Map(), (!e || !ln(e, this._schema)) && (e == null ? (this._position = 0, this._schema = null) : (this._started = !0, this._schema = e, this._writeSchema(e))), this;
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
    if (e && !ln(e, this._schema)) {
      if (this._started && this._autoDestroy)
        return this.close();
      this.reset(this._sink, e);
    }
    t instanceof st ? t instanceof En || this._writeRecordBatch(t) : t instanceof Z ? this.writeAll(t.batches) : je(t) && this.writeAll(t);
  }
  _writeMessage(t, e = 8) {
    const n = e - 1, s = tt.encode(t), r = s.byteLength, o = this._writeLegacyIpcFormat ? 4 : 8, a = r + o + n & ~n, c = a - r - o;
    return t.headerType === N.RecordBatch ? this._recordBatchBlocks.push(new Gt(a, t.bodyLength, this._position)) : t.headerType === N.DictionaryBatch && this._dictionaryBlocks.push(new Gt(a, t.bodyLength, this._position)), this._writeLegacyIpcFormat || this._write(Int32Array.of(-1)), this._write(Int32Array.of(a - o)), r > 0 && this._write(s), this._writePadding(c);
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
    return this._write(Ve);
  }
  _writePadding(t) {
    return t > 0 ? this._write(new Uint8Array(t)) : this;
  }
  _writeRecordBatch(t) {
    const { byteLength: e, nodes: n, bufferRegions: s, buffers: r } = W.assemble(t), o = new lt(t.numRows, n, s), a = tt.from(o, e);
    return this._writeDictionaries(t)._writeMessage(a)._writeBodyBuffers(r);
  }
  _writeDictionaryBatch(t, e, n = !1) {
    const { byteLength: s, nodes: r, bufferRegions: o, buffers: a } = W.assemble(new R([t])), c = new lt(t.length, r, o), u = new Et(c, e, n), d = tt.from(u, s);
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
class Mn extends mo {
  /** @nocollapse */
  static writeAll(t, e) {
    const n = new Mn(e);
    return Xt(t) ? t.then((s) => n.writeAll(s)) : Se(t) ? kn(n, t) : Pn(n, t);
  }
}
class Cn extends mo {
  /** @nocollapse */
  static writeAll(t) {
    const e = new Cn();
    return Xt(t) ? t.then((n) => e.writeAll(n)) : Se(t) ? kn(e, t) : Pn(e, t);
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
    const e = ze.encode(new ze(t, G.V5, this._recordBatchBlocks, this._dictionaryBlocks));
    return super._writeFooter(t)._write(e)._write(Int32Array.of(e.byteLength))._writeMagic();
  }
}
function Pn(i, t) {
  let e = t;
  t instanceof Z && (e = t.batches, i.reset(void 0, t.schema));
  for (const n of e)
    i.write(n);
  return i.finish();
}
function kn(i, t) {
  return B(this, void 0, void 0, function* () {
    var e, n, s, r, o, a, c;
    try {
      for (e = !0, n = Zt(t); s = yield n.next(), r = s.done, !r; e = !0) {
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
  return (t === "stream" ? Mn : Cn).writeAll(i).toUint8Array(!0);
}
var Jc = Object.create, _o = Object.defineProperty, Qc = Object.getOwnPropertyDescriptor, Zc = Object.getOwnPropertyNames, Xc = Object.getPrototypeOf, tl = Object.prototype.hasOwnProperty, el = (i, t) => () => (t || i((t = { exports: {} }).exports, t), t.exports), il = (i, t, e, n) => {
  if (t && typeof t == "object" || typeof t == "function") for (let s of Zc(t)) !tl.call(i, s) && s !== e && _o(i, s, { get: () => t[s], enumerable: !(n = Qc(t, s)) || n.enumerable });
  return i;
}, nl = (i, t, e) => (e = i != null ? Jc(Xc(i)) : {}, il(!i || !i.__esModule ? _o(e, "default", { value: i, enumerable: !0 }) : e, i)), sl = el((i, t) => {
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
    let e = new go(this._bindings, this._conn, t), n = await yt.from(e);
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
}, go = class {
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
    let t = await this.bindings.sendPrepared(this.connectionId, this.statementId, i), e = new go(this.bindings, this.connectionId, t), n = await yt.from(e);
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
function oi(i) {
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
      return { sqlType: "list", valueType: oi(i.valueType) };
    case l.FixedSizeBinary:
      return { sqlType: "fixedsizebinary", byteWidth: i.byteWidth };
    case l.Null:
      return { sqlType: "null" };
    case l.Utf8:
      return { sqlType: "utf8" };
    case l.Struct:
      return { sqlType: "struct", fields: i.children.map((t) => hn(t.name, t.type)) };
    case l.Map: {
      let t = i;
      return { sqlType: "map", keyType: oi(t.keyType), valueType: oi(t.valueType) };
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
function hn(i, t) {
  let e = oi(t);
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
        s.push(hn(r, o));
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
        s.push(hn(r, o));
      }
      e.columnsFlat = s, delete e.columns;
    }
    let n = new E("IMPORT_JSON_FROM_PATH", [i, t, e]);
    await this.postTask(n);
  }
}, bl = { version: "1.29.0" }, xn = bl.version.split(".");
xn[0];
xn[1];
xn[2];
nl(sl());
function wl() {
  let i = new TextDecoder();
  return (t) => (typeof SharedArrayBuffer < "u" && t.buffer instanceof SharedArrayBuffer && (t = new Uint8Array(t)), i.decode(t));
}
wl();
var vl = ((i) => (i[i.BUFFER = 0] = "BUFFER", i[i.NODE_FS = 1] = "NODE_FS", i[i.BROWSER_FILEREADER = 2] = "BROWSER_FILEREADER", i[i.BROWSER_FSACCESS = 3] = "BROWSER_FSACCESS", i[i.HTTP = 4] = "HTTP", i[i.S3 = 5] = "S3", i))(vl || {});
const $ = {
  config: null,
  duckDbPromise: null,
  registeredFiles: /* @__PURE__ */ new Set()
};
function Il(i) {
  return i ? i.endsWith("/") ? i.slice(0, -1) : i : "/duckdb";
}
function bo(i) {
  if (!i)
    throw new Error("DuckDB configuration is required.");
  if ($.config)
    return $.config;
  const t = Il(i.bundleBasePath ?? i.BundleBasePath ?? "/duckdb"), e = i.moduleLoader ?? i.ModuleLoader ?? "duckdb-browser-bundle.js", n = i.mainModule ?? i.MainModule ?? "duckdb-eh.wasm", s = i.pthreadWorker ?? i.PthreadWorker ?? "duckdb-browser-coi.pthread.worker.js", r = i.mainWorker ?? i.MainWorker ?? "duckdb-browser-eh.worker.js";
  return $.config = {
    bundleBasePath: t,
    moduleLoader: e,
    mainModule: n,
    pthreadWorker: s || null,
    mainWorker: r
  }, $.config;
}
function Ki(i, t) {
  return `${i}/${t}`;
}
async function wo() {
  if (!$.config)
    throw new Error("Call initialize before using DuckDB.");
  return $.duckDbPromise || ($.duckDbPromise = (async () => {
    const i = Ki($.config.bundleBasePath, $.config.mainWorker), t = new Worker(i, { type: "module" }), e = new dl(), n = new gl(e, t), s = Ki($.config.bundleBasePath, $.config.mainModule), r = $.config.pthreadWorker ? Ki($.config.bundleBasePath, $.config.pthreadWorker) : void 0;
    return await n.instantiate(s, r), { db: n, worker: t };
  })()), $.duckDbPromise;
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
    if (!$.registeredFiles.has(o)) {
      const a = await fetch(`api/parquet/file?key=${encodeURIComponent(r)}`);
      if (!a.ok)
        throw new Error(`Failed to download parquet file (${a.status})`);
      const c = new Uint8Array(await a.arrayBuffer());
      await i.registerFileBuffer(o, c), $.registeredFiles.add(o);
    }
    s.push(o);
  }
  return s;
}
function Tl(i) {
  return i.length === 1 ? JSON.stringify(i[0]) : `[${i.map((e) => JSON.stringify(e)).join(", ")}]`;
}
function Ji(i) {
  return i.replace(/\\/g, "\\\\").replace(/'/g, "''");
}
function Al(i) {
  const t = i.trim();
  return /[%_]/.test(t) ? t : `%${t}%`;
}
function Dl(i) {
  return i == null ? null : typeof i == "bigint" ? Number(i) : Array.isArray(i) || typeof i == "object" && i !== null ? JSON.stringify(i) : i;
}
function Fl(i, t) {
  const e = {};
  for (const n of t)
    e[n] = Dl(i[n]);
  return e;
}
function Qi(i, t, e) {
  const n = i?.[t] ?? i?.[e];
  return typeof n == "string" && n.trim().length > 0 ? n.trim() : null;
}
function Ol(i, t, e) {
  const n = i?.[t] ?? i?.[e];
  if (typeof n == "number" && Number.isFinite(n))
    return n;
  if (typeof n == "string" && n.length > 0) {
    const s = Number.parseInt(n, 10);
    return Number.isFinite(s) ? s : null;
  }
  return null;
}
function El(i) {
  const t = i?.FileKeys ?? i?.fileKeys;
  return Array.isArray(t) ? t : [];
}
async function Rl(i) {
  bo(i), await wo();
}
async function Ll(i) {
  if (!i)
    throw new Error("A query request is required.");
  bo($.config ?? {});
  const t = await wo(), e = El(i);
  if (e.length === 0)
    return [];
  const n = await Bl(t.db, e);
  if (n.length === 0)
    return [];
  const s = i?.SelectColumns ?? i?.selectColumns ?? "*", r = [], o = Qi(i, "Email", "email");
  if (o) {
    const k = Al(o);
    r.push(`email ILIKE '${Ji(k)}' ESCAPE '\\'`);
  }
  const a = Qi(i, "EventType", "eventType");
  a && r.push(`event = '${Ji(a)}'`);
  const c = Qi(i, "SgTemplateId", "sgTemplateId");
  c && r.push(`sg_template_id = '${Ji(c)}'`);
  const u = Ol(i, "Limit", "limit"), d = u && u > 0 ? ` LIMIT ${Math.min(u, 5e3)}` : "", h = r.length > 0 ? ` WHERE ${r.join(" AND ")}` : "", j = `SELECT ${s} FROM read_parquet(${Tl(n)}, union_by_name=true)${h} ORDER BY Timestamp DESC${d}`, F = await t.db.connect();
  try {
    const k = await F.query(j), zt = Array.isArray(k?.schema?.fields) ? k.schema.fields.map((Q) => Q?.name).filter((Q) => typeof Q == "string" && Q.length > 0) : [], Te = k.toArray().map((Q) => Fl(Q, zt));
    return typeof k.close == "function" ? k.close() : typeof k.release == "function" && k.release(), Te;
  } finally {
    await F.close();
  }
}
async function Ul() {
  if ($.duckDbPromise)
    try {
      const i = await $.duckDbPromise;
      await i.db.terminate(), i.worker.terminate();
    } finally {
      $.duckDbPromise = null, $.registeredFiles.clear();
    }
}
function Ml() {
  return $;
}
export {
  Ml as __getInternalState,
  Ul as dispose,
  Rl as initialize,
  Ll as queryEvents
};
//# sourceMappingURL=duckdb-browser-bundle.js.map
