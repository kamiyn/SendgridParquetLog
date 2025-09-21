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
function Wn(i) {
  var t = typeof Symbol == "function" && Symbol.iterator, e = t && i[t], n = 0;
  if (e) return e.call(i);
  if (i && typeof i.length == "number") return {
    next: function() {
      return i && n >= i.length && (i = void 0), { value: i && i[n++], done: !i };
    }
  };
  throw new TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function D(i) {
  return this instanceof D ? (this.v = i, this) : new D(i);
}
function Tt(i, t, e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var n = e.apply(i, t || []), s, r = [];
  return s = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), a("next"), a("throw"), a("return", o), s[Symbol.asyncIterator] = function() {
    return this;
  }, s;
  function o(F) {
    return function(G) {
      return Promise.resolve(G).then(F, h);
    };
  }
  function a(F, G) {
    n[F] && (s[F] = function(Vt) {
      return new Promise(function(Te, mt) {
        r.push([F, Vt, Te, mt]) > 1 || c(F, Vt);
      });
    }, G && (s[F] = G(s[F])));
  }
  function c(F, G) {
    try {
      u(n[F](G));
    } catch (Vt) {
      V(r[0][3], Vt);
    }
  }
  function u(F) {
    F.value instanceof D ? Promise.resolve(F.value.v).then(d, h) : V(r[0][2], F);
  }
  function d(F) {
    c("next", F);
  }
  function h(F) {
    c("throw", F);
  }
  function V(F, G) {
    F(G), r.shift(), r.length && c(r[0][0], r[0][1]);
  }
}
function ti(i) {
  var t, e;
  return t = {}, n("next"), n("throw", function(s) {
    throw s;
  }), n("return"), t[Symbol.iterator] = function() {
    return this;
  }, t;
  function n(s, r) {
    t[s] = i[s] ? function(o) {
      return (e = !e) ? { value: D(i[s](o)), done: !1 } : r ? r(o) : o;
    } : r;
  }
}
function Xt(i) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var t = i[Symbol.asyncIterator], e;
  return t ? t.call(i) : (i = typeof Wn == "function" ? Wn(i) : i[Symbol.iterator](), e = {}, n("next"), n("throw"), n("return"), e[Symbol.asyncIterator] = function() {
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
const To = new TextDecoder("utf-8"), nn = (i) => To.decode(i), Fo = new TextEncoder(), _n = (i) => Fo.encode(i), Oo = (i) => typeof i == "number", bs = (i) => typeof i == "boolean", H = (i) => typeof i == "function", st = (i) => i != null && Object(i) === i, te = (i) => st(i) && H(i.then), We = (i) => st(i) && H(i[Symbol.iterator]), De = (i) => st(i) && H(i[Symbol.asyncIterator]), sn = (i) => st(i) && st(i.schema), ws = (i) => st(i) && "done" in i && "value" in i, Is = (i) => st(i) && H(i.stat) && Oo(i.fd), vs = (i) => st(i) && gn(i.body), ji = (i) => "_getDOMStream" in i && "_getNodeStream" in i, Eo = (i) => st(i) && H(i.abort) && H(i.getWriter) && !ji(i), gn = (i) => st(i) && H(i.cancel) && H(i.getReader) && !ji(i), No = (i) => st(i) && H(i.end) && H(i.write) && bs(i.writable) && !ji(i), Ss = (i) => st(i) && H(i.read) && H(i.pipe) && bs(i.readable) && !ji(i), Ro = (i) => st(i) && H(i.clear) && H(i.bytes) && H(i.position) && H(i.setPosition) && H(i.capacity) && H(i.getBufferIdentifier) && H(i.createLong), bn = typeof SharedArrayBuffer < "u" ? SharedArrayBuffer : ArrayBuffer;
function Lo(i) {
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
function Gn(i, t, e = 0, n = t.byteLength) {
  const s = i.byteLength, r = new Uint8Array(i.buffer, i.byteOffset, s), o = new Uint8Array(t.buffer, t.byteOffset, Math.min(n, s));
  return r.set(o, e), i;
}
function Ot(i, t) {
  const e = Lo(i), n = e.reduce((d, h) => d + h.byteLength, 0);
  let s, r, o, a = 0, c = -1;
  const u = Math.min(t || Number.POSITIVE_INFINITY, n);
  for (const d = e.length; ++c < d; ) {
    if (s = e[c], r = s.subarray(0, Math.min(s.length, u - a)), u <= a + r.length) {
      r.length < s.length ? e[c] = s.subarray(r.length) : r.length === s.length && c++, o ? Gn(o, r, a) : o = r;
      break;
    }
    Gn(o || (o = new Uint8Array(u)), r, a), a += r.length;
  }
  return [o || new Uint8Array(0), e.slice(c), n - (o ? o.byteLength : 0)];
}
function P(i, t) {
  let e = ws(t) ? t.value : t;
  return e instanceof i ? i === Uint8Array ? new i(e.buffer, e.byteOffset, e.byteLength) : e : e ? (typeof e == "string" && (e = _n(e)), e instanceof ArrayBuffer ? new i(e) : e instanceof bn ? new i(e) : Ro(e) ? P(i, e.bytes()) : ArrayBuffer.isView(e) ? e.byteLength <= 0 ? new i(0) : new i(e.buffer, e.byteOffset, e.byteLength / i.BYTES_PER_ELEMENT) : i.from(e)) : new i(0);
}
const Fe = (i) => P(Int32Array, i), Hn = (i) => P(BigInt64Array, i), O = (i) => P(Uint8Array, i), rn = (i) => (i.next(), i);
function* Uo(i, t) {
  const e = function* (s) {
    yield s;
  }, n = typeof t == "string" || ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof bn ? e(t) : We(t) ? t : e(t);
  return yield* rn((function* (s) {
    let r = null;
    do
      r = s.next(yield P(i, r));
    while (!r.done);
  })(n[Symbol.iterator]())), new i();
}
const Mo = (i) => Uo(Uint8Array, i);
function Bs(i, t) {
  return Tt(this, arguments, function* () {
    if (te(t))
      return yield D(yield D(yield* ti(Xt(Bs(i, yield D(t))))));
    const n = function(o) {
      return Tt(this, arguments, function* () {
        yield yield D(yield D(o));
      });
    }, s = function(o) {
      return Tt(this, arguments, function* () {
        yield D(yield* ti(Xt(rn((function* (a) {
          let c = null;
          do
            c = a.next(yield c?.value);
          while (!c.done);
        })(o[Symbol.iterator]())))));
      });
    }, r = typeof t == "string" || ArrayBuffer.isView(t) || t instanceof ArrayBuffer || t instanceof bn ? n(t) : We(t) ? s(t) : De(t) ? t : n(t);
    return yield D(
      // otherwise if AsyncIterable, use it
      yield* ti(Xt(rn((function(o) {
        return Tt(this, arguments, function* () {
          let a = null;
          do
            a = yield D(o.next(yield yield D(P(i, a))));
          while (!a.done);
        });
      })(r[Symbol.asyncIterator]()))))
    ), yield D(new i());
  });
}
const Co = (i) => Bs(Uint8Array, i);
function Ds(i, t, e) {
  if (i !== 0) {
    e = e.slice(0, t);
    for (let n = -1, s = e.length; ++n < s; )
      e[n] += i;
  }
  return e.subarray(0, t);
}
function Po(i, t) {
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
const ut = {
  fromIterable(i) {
    return Je(ko(i));
  },
  fromAsyncIterable(i) {
    return Je(xo(i));
  },
  fromDOMStream(i) {
    return Je(zo(i));
  },
  fromNodeStream(i) {
    return Je(jo(i));
  },
  // @ts-ignore
  toDOMStream(i, t) {
    throw new Error('"toDOMStream" not available in this environment');
  },
  // @ts-ignore
  toNodeStream(i, t) {
    throw new Error('"toNodeStream" not available in this environment');
  }
}, Je = (i) => (i.next(), i);
function* ko(i) {
  let t, e = !1, n = [], s, r, o, a = 0;
  function c() {
    return r === "peek" ? Ot(n, o)[0] : ([s, n, a] = Ot(n, o), s);
  }
  ({ cmd: r, size: o } = (yield null) || { cmd: "read", size: 0 });
  const u = Mo(i)[Symbol.iterator]();
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
function xo(i) {
  return Tt(this, arguments, function* () {
    let e, n = !1, s = [], r, o, a, c = 0;
    function u() {
      return o === "peek" ? Ot(s, a)[0] : ([r, s, c] = Ot(s, a), r);
    }
    ({ cmd: o, size: a } = (yield yield D(null)) || { cmd: "read", size: 0 });
    const d = Co(i)[Symbol.asyncIterator]();
    try {
      do
        if ({ done: e, value: r } = Number.isNaN(a - c) ? yield D(d.next()) : yield D(d.next(a - c)), !e && r.byteLength > 0 && (s.push(r), c += r.byteLength), e || a <= c)
          do
            ({ cmd: o, size: a } = yield yield D(u()));
          while (a < c);
      while (!e);
    } catch (h) {
      (n = !0) && typeof d.throw == "function" && (yield D(d.throw(h)));
    } finally {
      n === !1 && typeof d.return == "function" && (yield D(d.return(new Uint8Array(0))));
    }
    return yield D(null);
  });
}
function zo(i) {
  return Tt(this, arguments, function* () {
    let e = !1, n = !1, s = [], r, o, a, c = 0;
    function u() {
      return o === "peek" ? Ot(s, a)[0] : ([r, s, c] = Ot(s, a), r);
    }
    ({ cmd: o, size: a } = (yield yield D(null)) || { cmd: "read", size: 0 });
    const d = new Vo(i);
    try {
      do
        if ({ done: e, value: r } = Number.isNaN(a - c) ? yield D(d.read()) : yield D(d.read(a - c)), !e && r.byteLength > 0 && (s.push(O(r)), c += r.byteLength), e || a <= c)
          do
            ({ cmd: o, size: a } = yield yield D(u()));
          while (a < c);
      while (!e);
    } catch (h) {
      (n = !0) && (yield D(d.cancel(h)));
    } finally {
      n === !1 ? yield D(d.cancel()) : i.locked && d.releaseLock();
    }
    return yield D(null);
  });
}
class Vo {
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
const Hi = (i, t) => {
  const e = (s) => n([t, s]);
  let n;
  return [t, e, new Promise((s) => (n = s) && i.once(t, e))];
};
function jo(i) {
  return Tt(this, arguments, function* () {
    const e = [];
    let n = "error", s = !1, r = null, o, a, c = 0, u = [], d;
    function h() {
      return o === "peek" ? Ot(u, a)[0] : ([d, u, c] = Ot(u, a), d);
    }
    if ({ cmd: o, size: a } = (yield yield D(null)) || { cmd: "read", size: 0 }, i.isTTY)
      return yield yield D(new Uint8Array(0)), yield D(null);
    try {
      e[0] = Hi(i, "end"), e[1] = Hi(i, "error");
      do {
        if (e[2] = Hi(i, "readable"), [n, r] = yield D(Promise.race(e.map((F) => F[2]))), n === "error")
          break;
        if ((s = n === "end") || (Number.isFinite(a - c) ? (d = O(i.read(a - c)), d.byteLength < a - c && (d = O(i.read()))) : d = O(i.read()), d.byteLength > 0 && (u.push(d), c += d.byteLength)), s || a <= c)
          do
            ({ cmd: o, size: a } = yield yield D(h()));
          while (a < c);
      } while (!s);
    } finally {
      yield D(V(e, n === "error" ? r : null));
    }
    return yield D(null);
    function V(F, G) {
      return d = u = null, new Promise((Vt, Te) => {
        for (const [mt, _t] of F)
          i.off(mt, _t);
        try {
          const mt = i.destroy;
          mt && mt.call(i, G), G = void 0;
        } catch (mt) {
          G = mt || G;
        } finally {
          G != null ? Te(G) : Vt();
        }
      });
    }
  });
}
var W;
(function(i) {
  i[i.V1 = 0] = "V1", i[i.V2 = 1] = "V2", i[i.V3 = 2] = "V3", i[i.V4 = 3] = "V4", i[i.V5 = 4] = "V5";
})(W || (W = {}));
var J;
(function(i) {
  i[i.Sparse = 0] = "Sparse", i[i.Dense = 1] = "Dense";
})(J || (J = {}));
var K;
(function(i) {
  i[i.HALF = 0] = "HALF", i[i.SINGLE = 1] = "SINGLE", i[i.DOUBLE = 2] = "DOUBLE";
})(K || (K = {}));
var yt;
(function(i) {
  i[i.DAY = 0] = "DAY", i[i.MILLISECOND = 1] = "MILLISECOND";
})(yt || (yt = {}));
var g;
(function(i) {
  i[i.SECOND = 0] = "SECOND", i[i.MILLISECOND = 1] = "MILLISECOND", i[i.MICROSECOND = 2] = "MICROSECOND", i[i.NANOSECOND = 3] = "NANOSECOND";
})(g || (g = {}));
var Et;
(function(i) {
  i[i.YEAR_MONTH = 0] = "YEAR_MONTH", i[i.DAY_TIME = 1] = "DAY_TIME", i[i.MONTH_DAY_NANO = 2] = "MONTH_DAY_NANO";
})(Et || (Et = {}));
const qi = 2, Bt = 4, Ct = 4, U = 4, Yt = new Int32Array(2), qn = new Float32Array(Yt.buffer), Kn = new Float64Array(Yt.buffer), Qe = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;
var on;
(function(i) {
  i[i.UTF8_BYTES = 1] = "UTF8_BYTES", i[i.UTF16_STRING = 2] = "UTF16_STRING";
})(on || (on = {}));
let we = class As {
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
    return new As(new Uint8Array(t));
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
    return Yt[0] = this.readInt32(t), qn[0];
  }
  readFloat64(t) {
    return Yt[Qe ? 0 : 1] = this.readInt32(t), Yt[Qe ? 1 : 0] = this.readInt32(t + 4), Kn[0];
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
    qn[0] = e, this.writeInt32(t, Yt[0]);
  }
  writeFloat64(t, e) {
    Kn[0] = e, this.writeInt32(t, Yt[Qe ? 0 : 1]), this.writeInt32(t + 4, Yt[Qe ? 1 : 0]);
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
    return e === on.UTF8_BYTES ? s : this.text_decoder_.decode(s);
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
}, Ts = class Fs {
  /**
   * Create a FlatBufferBuilder.
   */
  constructor(t) {
    this.minalign = 1, this.vtable = null, this.vtable_in_use = 0, this.isNested = !1, this.object_start = 0, this.vtables = [], this.vector_num_elems = 0, this.force_defaults = !1, this.string_maps = null, this.text_encoder = new TextEncoder();
    let e;
    t ? e = t : e = 1024, this.bb = we.allocate(e), this.space = e;
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
      this.bb = Fs.growByteBuffer(this.bb), this.space += this.bb.capacity() - s;
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
    const n = e << 1, s = we.allocate(n);
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
    const r = (n + s) * qi;
    this.addInt16(r);
    let o = 0;
    const a = this.space;
    t: for (e = 0; e < this.vtables.length; e++) {
      const c = this.bb.capacity() - this.vtables[e];
      if (r == this.bb.readInt16(c)) {
        for (let u = qi; u < r; u += qi)
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
var di;
(function(i) {
  i[i.BUFFER = 0] = "BUFFER";
})(di || (di = {}));
var hi;
(function(i) {
  i[i.LZ4_FRAME = 0] = "LZ4_FRAME", i[i.ZSTD = 1] = "ZSTD";
})(hi || (hi = {}));
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
    return t ? this.bb.readInt8(this.bb_pos + t) : hi.LZ4_FRAME;
  }
  /**
   * Indicates the way the record batch body was compressed
   */
  method() {
    const t = this.bb.__offset(this.bb_pos, 6);
    return t ? this.bb.readInt8(this.bb_pos + t) : di.BUFFER;
  }
  static startBodyCompression(t) {
    t.startObject(2);
  }
  static addCodec(t, e) {
    t.addFieldInt8(0, e, hi.LZ4_FRAME);
  }
  static addMethod(t, e) {
    t.addFieldInt8(1, e, di.BUFFER);
  }
  static endBodyCompression(t) {
    return t.endObject();
  }
  static createBodyCompression(t, e, n) {
    return Wt.startBodyCompression(t), Wt.addCodec(t, e), Wt.addMethod(t, n), Wt.endBodyCompression(t);
  }
}
class Os {
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
let Es = class {
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
}, Lt = class an {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsRecordBatch(t, e) {
    return (e || new an()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsRecordBatch(t, e) {
    return t.setPosition(t.position() + U), (e || new an()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return n ? (e || new Es()).__init(this.bb.__vector(this.bb_pos + n) + t * 16, this.bb) : null;
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
    return n ? (e || new Os()).__init(this.bb.__vector(this.bb_pos + n) + t * 16, this.bb) : null;
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
}, re = class cn {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsDictionaryBatch(t, e) {
    return (e || new cn()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsDictionaryBatch(t, e) {
    return t.setPosition(t.position() + U), (e || new cn()).__init(t.readInt32(t.position()) + t.position(), t);
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
var Ie;
(function(i) {
  i[i.Little = 0] = "Little", i[i.Big = 1] = "Big";
})(Ie || (Ie = {}));
var fi;
(function(i) {
  i[i.DenseArray = 0] = "DenseArray";
})(fi || (fi = {}));
class at {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsInt(t, e) {
    return (e || new at()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsInt(t, e) {
    return t.setPosition(t.position() + U), (e || new at()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return at.startInt(t), at.addBitWidth(t, e), at.addIsSigned(t, n), at.endInt(t);
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
    return e ? (t || new at()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
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
    return t ? this.bb.readInt16(this.bb_pos + t) : fi.DenseArray;
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
    t.addFieldInt16(3, e, fi.DenseArray);
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
let Jn = class Oe {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsBinary(t, e) {
    return (e || new Oe()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsBinary(t, e) {
    return t.setPosition(t.position() + U), (e || new Oe()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startBinary(t) {
    t.startObject(0);
  }
  static endBinary(t) {
    return t.endObject();
  }
  static createBinary(t) {
    return Oe.startBinary(t), Oe.endBinary(t);
  }
}, Qn = class Ee {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsBool(t, e) {
    return (e || new Ee()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsBool(t, e) {
    return t.setPosition(t.position() + U), (e || new Ee()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startBool(t) {
    t.startObject(0);
  }
  static endBool(t) {
    return t.endObject();
  }
  static createBool(t) {
    return Ee.startBool(t), Ee.endBool(t);
  }
}, ei = class oe {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsDate(t, e) {
    return (e || new oe()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsDate(t, e) {
    return t.setPosition(t.position() + U), (e || new oe()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  unit() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : yt.MILLISECOND;
  }
  static startDate(t) {
    t.startObject(1);
  }
  static addUnit(t, e) {
    t.addFieldInt16(0, e, yt.MILLISECOND);
  }
  static endDate(t) {
    return t.endObject();
  }
  static createDate(t, e) {
    return oe.startDate(t), oe.addUnit(t, e), oe.endDate(t);
  }
}, ae = class $t {
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
}, ii = class ce {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsDuration(t, e) {
    return (e || new ce()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsDuration(t, e) {
    return t.setPosition(t.position() + U), (e || new ce()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return ce.startDuration(t), ce.addUnit(t, e), ce.endDuration(t);
  }
}, ni = class le {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsFixedSizeBinary(t, e) {
    return (e || new le()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsFixedSizeBinary(t, e) {
    return t.setPosition(t.position() + U), (e || new le()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return le.startFixedSizeBinary(t), le.addByteWidth(t, e), le.endFixedSizeBinary(t);
  }
}, si = class ue {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsFixedSizeList(t, e) {
    return (e || new ue()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsFixedSizeList(t, e) {
    return t.setPosition(t.position() + U), (e || new ue()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return ue.startFixedSizeList(t), ue.addListSize(t, e), ue.endFixedSizeList(t);
  }
};
class Dt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsFloatingPoint(t, e) {
    return (e || new Dt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsFloatingPoint(t, e) {
    return t.setPosition(t.position() + U), (e || new Dt()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return Dt.startFloatingPoint(t), Dt.addPrecision(t, e), Dt.endFloatingPoint(t);
  }
}
class At {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsInterval(t, e) {
    return (e || new At()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsInterval(t, e) {
    return t.setPosition(t.position() + U), (e || new At()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return At.startInterval(t), At.addUnit(t, e), At.endInterval(t);
  }
}
let Zn = class Ne {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsLargeBinary(t, e) {
    return (e || new Ne()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsLargeBinary(t, e) {
    return t.setPosition(t.position() + U), (e || new Ne()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startLargeBinary(t) {
    t.startObject(0);
  }
  static endLargeBinary(t) {
    return t.endObject();
  }
  static createLargeBinary(t) {
    return Ne.startLargeBinary(t), Ne.endLargeBinary(t);
  }
}, Xn = class Re {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsLargeUtf8(t, e) {
    return (e || new Re()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsLargeUtf8(t, e) {
    return t.setPosition(t.position() + U), (e || new Re()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startLargeUtf8(t) {
    t.startObject(0);
  }
  static endLargeUtf8(t) {
    return t.endObject();
  }
  static createLargeUtf8(t) {
    return Re.startLargeUtf8(t), Re.endLargeUtf8(t);
  }
}, ts = class Le {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsList(t, e) {
    return (e || new Le()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsList(t, e) {
    return t.setPosition(t.position() + U), (e || new Le()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startList(t) {
    t.startObject(0);
  }
  static endList(t) {
    return t.endObject();
  }
  static createList(t) {
    return Le.startList(t), Le.endList(t);
  }
}, ri = class de {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsMap(t, e) {
    return (e || new de()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsMap(t, e) {
    return t.setPosition(t.position() + U), (e || new de()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return de.startMap(t), de.addKeysSorted(t, e), de.endMap(t);
  }
}, es = class Ue {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsNull(t, e) {
    return (e || new Ue()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsNull(t, e) {
    return t.setPosition(t.position() + U), (e || new Ue()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startNull(t) {
    t.startObject(0);
  }
  static endNull(t) {
    return t.endObject();
  }
  static createNull(t) {
    return Ue.startNull(t), Ue.endNull(t);
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
class dt {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsTime(t, e) {
    return (e || new dt()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsTime(t, e) {
    return t.setPosition(t.position() + U), (e || new dt()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return dt.startTime(t), dt.addUnit(t, e), dt.addBitWidth(t, n), dt.endTime(t);
  }
}
class ht {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsTimestamp(t, e) {
    return (e || new ht()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsTimestamp(t, e) {
    return t.setPosition(t.position() + U), (e || new ht()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return ht.startTimestamp(t), ht.addUnit(t, e), ht.addTimezone(t, n), ht.endTimestamp(t);
  }
}
class it {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsUnion(t, e) {
    return (e || new it()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsUnion(t, e) {
    return t.setPosition(t.position() + U), (e || new it()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return it.startUnion(t), it.addMode(t, e), it.addTypeIds(t, n), it.endUnion(t);
  }
}
let is = class Me {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsUtf8(t, e) {
    return (e || new Me()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsUtf8(t, e) {
    return t.setPosition(t.position() + U), (e || new Me()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static startUtf8(t) {
    t.startObject(0);
  }
  static endUtf8(t) {
    return t.endObject();
  }
  static createUtf8(t) {
    return Me.startUtf8(t), Me.endUtf8(t);
  }
};
var z;
(function(i) {
  i[i.NONE = 0] = "NONE", i[i.Null = 1] = "Null", i[i.Int = 2] = "Int", i[i.FloatingPoint = 3] = "FloatingPoint", i[i.Binary = 4] = "Binary", i[i.Utf8 = 5] = "Utf8", i[i.Bool = 6] = "Bool", i[i.Decimal = 7] = "Decimal", i[i.Date = 8] = "Date", i[i.Time = 9] = "Time", i[i.Timestamp = 10] = "Timestamp", i[i.Interval = 11] = "Interval", i[i.List = 12] = "List", i[i.Struct_ = 13] = "Struct_", i[i.Union = 14] = "Union", i[i.FixedSizeBinary = 15] = "FixedSizeBinary", i[i.FixedSizeList = 16] = "FixedSizeList", i[i.Map = 17] = "Map", i[i.Duration = 18] = "Duration", i[i.LargeBinary = 19] = "LargeBinary", i[i.LargeUtf8 = 20] = "LargeUtf8", i[i.LargeList = 21] = "LargeList", i[i.RunEndEncoded = 22] = "RunEndEncoded";
})(z || (z = {}));
let lt = class oi {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsField(t, e) {
    return (e || new oi()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsField(t, e) {
    return t.setPosition(t.position() + U), (e || new oi()).__init(t.readInt32(t.position()) + t.position(), t);
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
    return e ? (t || new Pt()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
  }
  /**
   * children apply only to nested data types like Struct, List and Union. For
   * primitive types children will have length 0.
   */
  children(t, e) {
    const n = this.bb.__offset(this.bb_pos, 14);
    return n ? (e || new oi()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + n) + t * 4), this.bb) : null;
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
}, vt = class Rt {
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
    return t ? this.bb.readInt16(this.bb_pos + t) : Ie.Little;
  }
  fields(t, e) {
    const n = this.bb.__offset(this.bb_pos, 6);
    return n ? (e || new lt()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + n) + t * 4), this.bb) : null;
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
    t.addFieldInt16(0, e, Ie.Little);
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
const $o = void 0;
function ke(i) {
  if (i === null)
    return "null";
  if (i === $o)
    return "undefined";
  switch (typeof i) {
    case "number":
      return `${i}`;
    case "bigint":
      return `${i}`;
    case "string":
      return `"${i}"`;
  }
  return typeof i[Symbol.toPrimitive] == "function" ? i[Symbol.toPrimitive]("string") : ArrayBuffer.isView(i) ? i instanceof BigInt64Array || i instanceof BigUint64Array ? `[${[...i].map((t) => ke(t))}]` : `[${i}]` : ArrayBuffer.isView(i) ? `[${i}]` : JSON.stringify(i, (t, e) => typeof e == "bigint" ? `${e}` : e);
}
function x(i) {
  if (typeof i == "bigint" && (i < Number.MIN_SAFE_INTEGER || i > Number.MAX_SAFE_INTEGER))
    throw new TypeError(`${i} is not safe to convert to a number.`);
  return Number(i);
}
function Ns(i, t) {
  return x(i / t) + x(i % t) / x(t);
}
const Yo = Symbol.for("isArrowBigNum");
function wt(i, ...t) {
  return t.length === 0 ? Object.setPrototypeOf(P(this.TypedArray, i), this.constructor.prototype) : Object.setPrototypeOf(new this.TypedArray(i, ...t), this.constructor.prototype);
}
wt.prototype[Yo] = !0;
wt.prototype.toJSON = function() {
  return `"${ze(this)}"`;
};
wt.prototype.valueOf = function(i) {
  return Rs(this, i);
};
wt.prototype.toString = function() {
  return ze(this);
};
wt.prototype[Symbol.toPrimitive] = function(i = "default") {
  switch (i) {
    case "number":
      return Rs(this);
    case "string":
      return ze(this);
    case "default":
      return Ho(this);
  }
  return ze(this);
};
function me(...i) {
  return wt.apply(this, i);
}
function _e(...i) {
  return wt.apply(this, i);
}
function xe(...i) {
  return wt.apply(this, i);
}
Object.setPrototypeOf(me.prototype, Object.create(Int32Array.prototype));
Object.setPrototypeOf(_e.prototype, Object.create(Uint32Array.prototype));
Object.setPrototypeOf(xe.prototype, Object.create(Uint32Array.prototype));
Object.assign(me.prototype, wt.prototype, { constructor: me, signed: !0, TypedArray: Int32Array, BigIntArray: BigInt64Array });
Object.assign(_e.prototype, wt.prototype, { constructor: _e, signed: !1, TypedArray: Uint32Array, BigIntArray: BigUint64Array });
Object.assign(xe.prototype, wt.prototype, { constructor: xe, signed: !0, TypedArray: Uint32Array, BigIntArray: BigUint64Array });
const Wo = BigInt(4294967296) * BigInt(4294967296), Go = Wo - BigInt(1);
function Rs(i, t) {
  const { buffer: e, byteOffset: n, byteLength: s, signed: r } = i, o = new BigUint64Array(e, n, s / 8), a = r && o.at(-1) & BigInt(1) << BigInt(63);
  let c = BigInt(0), u = 0;
  if (a) {
    for (const d of o)
      c |= (d ^ Go) * (BigInt(1) << BigInt(64 * u++));
    c *= BigInt(-1), c -= BigInt(1);
  } else
    for (const d of o)
      c |= d * (BigInt(1) << BigInt(64 * u++));
  if (typeof t == "number") {
    const d = BigInt(Math.pow(10, t)), h = c / d, V = c % d;
    return x(h) + x(V) / x(d);
  }
  return x(c);
}
function ze(i) {
  if (i.byteLength === 8)
    return `${new i.BigIntArray(i.buffer, i.byteOffset, 1)[0]}`;
  if (!i.signed)
    return Ki(i);
  let t = new Uint16Array(i.buffer, i.byteOffset, i.byteLength / 2);
  if (new Int16Array([t.at(-1)])[0] >= 0)
    return Ki(i);
  t = t.slice();
  let n = 1;
  for (let r = 0; r < t.length; r++) {
    const o = t[r], a = ~o + n;
    t[r] = a, n &= o === 0 ? 1 : 0;
  }
  return `-${Ki(t)}`;
}
function Ho(i) {
  return i.byteLength === 8 ? new i.BigIntArray(i.buffer, i.byteOffset, 1)[0] : ze(i);
}
function Ki(i) {
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
class wn {
  /** @nocollapse */
  static new(t, e) {
    switch (e) {
      case !0:
        return new me(t);
      case !1:
        return new _e(t);
    }
    switch (t.constructor) {
      case Int8Array:
      case Int16Array:
      case Int32Array:
      case BigInt64Array:
        return new me(t);
    }
    return t.byteLength === 16 ? new xe(t) : new _e(t);
  }
  /** @nocollapse */
  static signed(t) {
    return new me(t);
  }
  /** @nocollapse */
  static unsigned(t) {
    return new _e(t);
  }
  /** @nocollapse */
  static decimal(t) {
    return new xe(t);
  }
  constructor(t, e) {
    return wn.new(t, e);
  }
}
var Ls, Us, Ms, Cs, Ps, ks, xs, zs, Vs, js, $s, Ys, Ws, Gs, Hs, qs, Ks, Js, Qs, Zs, Xs, tr;
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
Ls = Symbol.toStringTag;
f[Ls] = ((i) => (i.children = null, i.ArrayType = Array, i.OffsetArrayType = Int32Array, i[Symbol.toStringTag] = "DataType"))(f.prototype);
class Gt extends f {
  constructor() {
    super(l.Null);
  }
  toString() {
    return "Null";
  }
}
Us = Symbol.toStringTag;
Gt[Us] = ((i) => i[Symbol.toStringTag] = "Null")(Gt.prototype);
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
Ms = Symbol.toStringTag;
ee[Ms] = ((i) => (i.isSigned = null, i.bitWidth = null, i[Symbol.toStringTag] = "Int"))(ee.prototype);
class Ve extends ee {
  constructor() {
    super(!0, 32);
  }
  get ArrayType() {
    return Int32Array;
  }
}
Object.defineProperty(Ve.prototype, "ArrayType", { value: Int32Array });
class yi extends f {
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
Cs = Symbol.toStringTag;
yi[Cs] = ((i) => (i.precision = null, i[Symbol.toStringTag] = "Float"))(yi.prototype);
class pi extends f {
  constructor() {
    super(l.Binary);
  }
  toString() {
    return "Binary";
  }
}
Ps = Symbol.toStringTag;
pi[Ps] = ((i) => (i.ArrayType = Uint8Array, i[Symbol.toStringTag] = "Binary"))(pi.prototype);
class mi extends f {
  constructor() {
    super(l.LargeBinary);
  }
  toString() {
    return "LargeBinary";
  }
}
ks = Symbol.toStringTag;
mi[ks] = ((i) => (i.ArrayType = Uint8Array, i.OffsetArrayType = BigInt64Array, i[Symbol.toStringTag] = "LargeBinary"))(mi.prototype);
class _i extends f {
  constructor() {
    super(l.Utf8);
  }
  toString() {
    return "Utf8";
  }
}
xs = Symbol.toStringTag;
_i[xs] = ((i) => (i.ArrayType = Uint8Array, i[Symbol.toStringTag] = "Utf8"))(_i.prototype);
class gi extends f {
  constructor() {
    super(l.LargeUtf8);
  }
  toString() {
    return "LargeUtf8";
  }
}
zs = Symbol.toStringTag;
gi[zs] = ((i) => (i.ArrayType = Uint8Array, i.OffsetArrayType = BigInt64Array, i[Symbol.toStringTag] = "LargeUtf8"))(gi.prototype);
class bi extends f {
  constructor() {
    super(l.Bool);
  }
  toString() {
    return "Bool";
  }
}
Vs = Symbol.toStringTag;
bi[Vs] = ((i) => (i.ArrayType = Uint8Array, i[Symbol.toStringTag] = "Bool"))(bi.prototype);
class wi extends f {
  constructor(t, e, n = 128) {
    super(l.Decimal), this.scale = t, this.precision = e, this.bitWidth = n;
  }
  toString() {
    return `Decimal[${this.precision}e${this.scale > 0 ? "+" : ""}${this.scale}]`;
  }
}
js = Symbol.toStringTag;
wi[js] = ((i) => (i.scale = null, i.precision = null, i.ArrayType = Uint32Array, i[Symbol.toStringTag] = "Decimal"))(wi.prototype);
class Ii extends f {
  constructor(t) {
    super(l.Date), this.unit = t;
  }
  toString() {
    return `Date${(this.unit + 1) * 32}<${yt[this.unit]}>`;
  }
  get ArrayType() {
    return this.unit === yt.DAY ? Int32Array : BigInt64Array;
  }
}
$s = Symbol.toStringTag;
Ii[$s] = ((i) => (i.unit = null, i[Symbol.toStringTag] = "Date"))(Ii.prototype);
class vi extends f {
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
Ys = Symbol.toStringTag;
vi[Ys] = ((i) => (i.unit = null, i.bitWidth = null, i[Symbol.toStringTag] = "Time"))(vi.prototype);
class Si extends f {
  constructor(t, e) {
    super(l.Timestamp), this.unit = t, this.timezone = e;
  }
  toString() {
    return `Timestamp<${g[this.unit]}${this.timezone ? `, ${this.timezone}` : ""}>`;
  }
}
Ws = Symbol.toStringTag;
Si[Ws] = ((i) => (i.unit = null, i.timezone = null, i.ArrayType = BigInt64Array, i[Symbol.toStringTag] = "Timestamp"))(Si.prototype);
class Bi extends f {
  constructor(t) {
    super(l.Interval), this.unit = t;
  }
  toString() {
    return `Interval<${Et[this.unit]}>`;
  }
}
Gs = Symbol.toStringTag;
Bi[Gs] = ((i) => (i.unit = null, i.ArrayType = Int32Array, i[Symbol.toStringTag] = "Interval"))(Bi.prototype);
class Di extends f {
  constructor(t) {
    super(l.Duration), this.unit = t;
  }
  toString() {
    return `Duration<${g[this.unit]}>`;
  }
}
Hs = Symbol.toStringTag;
Di[Hs] = ((i) => (i.unit = null, i.ArrayType = BigInt64Array, i[Symbol.toStringTag] = "Duration"))(Di.prototype);
class Ai extends f {
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
qs = Symbol.toStringTag;
Ai[qs] = ((i) => (i.children = null, i[Symbol.toStringTag] = "List"))(Ai.prototype);
class Z extends f {
  constructor(t) {
    super(l.Struct), this.children = t;
  }
  toString() {
    return `Struct<{${this.children.map((t) => `${t.name}:${t.type}`).join(", ")}}>`;
  }
}
Ks = Symbol.toStringTag;
Z[Ks] = ((i) => (i.children = null, i[Symbol.toStringTag] = "Struct"))(Z.prototype);
class Ti extends f {
  constructor(t, e, n) {
    super(l.Union), this.mode = t, this.children = n, this.typeIds = e = Int32Array.from(e), this.typeIdToChildIndex = e.reduce((s, r, o) => (s[r] = o) && s || s, /* @__PURE__ */ Object.create(null));
  }
  toString() {
    return `${this[Symbol.toStringTag]}<${this.children.map((t) => `${t.type}`).join(" | ")}>`;
  }
}
Js = Symbol.toStringTag;
Ti[Js] = ((i) => (i.mode = null, i.typeIds = null, i.children = null, i.typeIdToChildIndex = null, i.ArrayType = Int8Array, i[Symbol.toStringTag] = "Union"))(Ti.prototype);
class Fi extends f {
  constructor(t) {
    super(l.FixedSizeBinary), this.byteWidth = t;
  }
  toString() {
    return `FixedSizeBinary[${this.byteWidth}]`;
  }
}
Qs = Symbol.toStringTag;
Fi[Qs] = ((i) => (i.byteWidth = null, i.ArrayType = Uint8Array, i[Symbol.toStringTag] = "FixedSizeBinary"))(Fi.prototype);
class Oi extends f {
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
Zs = Symbol.toStringTag;
Oi[Zs] = ((i) => (i.children = null, i.listSize = null, i[Symbol.toStringTag] = "FixedSizeList"))(Oi.prototype);
class Ei extends f {
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
Xs = Symbol.toStringTag;
Ei[Xs] = ((i) => (i.children = null, i.keysSorted = null, i[Symbol.toStringTag] = "Map_"))(Ei.prototype);
const qo = /* @__PURE__ */ ((i) => () => ++i)(-1);
class ve extends f {
  constructor(t, e, n, s) {
    super(l.Dictionary), this.indices = e, this.dictionary = t, this.isOrdered = s || !1, this.id = n == null ? qo() : x(n);
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
tr = Symbol.toStringTag;
ve[tr] = ((i) => (i.id = null, i.indices = null, i.isOrdered = null, i.dictionary = null, i[Symbol.toStringTag] = "Dictionary"))(ve.prototype);
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
class A {
  visitMany(t, ...e) {
    return t.map((n, s) => this.visit(n, ...e.map((r) => r[s])));
  }
  visit(...t) {
    return this.getVisitFn(t[0], !1).apply(this, t);
  }
  getVisitFn(t, e = !0) {
    return Ko(this, t, e);
  }
  getVisitFnByTypeId(t, e = !0) {
    return he(this, t, e);
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
function Ko(i, t, e = !0) {
  return typeof t == "number" ? he(i, t, e) : typeof t == "string" && t in l ? he(i, l[t], e) : t && t instanceof f ? he(i, ns(t), e) : t?.type && t.type instanceof f ? he(i, ns(t.type), e) : he(i, l.NONE, e);
}
function he(i, t, e = !0) {
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
function ns(i) {
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
        case yt.DAY:
          return l.DateDay;
        case yt.MILLISECOND:
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
const er = new Float64Array(1), se = new Uint32Array(er.buffer);
function ir(i) {
  const t = (i & 31744) >> 10, e = (i & 1023) / 1024, n = Math.pow(-1, (i & 32768) >> 15);
  switch (t) {
    case 31:
      return n * (e ? Number.NaN : 1 / 0);
    case 0:
      return n * (e ? 6103515625e-14 * e : 0);
  }
  return n * Math.pow(2, t - 15) * (1 + e);
}
function Jo(i) {
  if (i !== i)
    return 32256;
  er[0] = i;
  const t = (se[1] & 2147483648) >> 16 & 65535;
  let e = se[1] & 2146435072, n = 0;
  return e >= 1089470464 ? se[0] > 0 ? e = 31744 : (e = (e & 2080374784) >> 16, n = (se[1] & 1048575) >> 10) : e <= 1056964608 ? (n = 1048576 + (se[1] & 1048575), n = 1048576 + (n << (e >> 20) - 998) >> 21, e = 0) : (e = e - 1056964608 >> 10, n = (se[1] & 1048575) + 512 >> 10), t | e | n & 65535;
}
class b extends A {
}
function v(i) {
  return (t, e, n) => {
    if (t.setValid(e, n != null))
      return i(t, e, n);
  };
}
const Qo = (i, t, e) => {
  i[t] = Math.floor(e / 864e5);
}, nr = (i, t, e, n) => {
  if (e + 1 < t.length) {
    const s = x(t[e]), r = x(t[e + 1]);
    i.set(n.subarray(0, r - s), s);
  }
}, Zo = ({ offset: i, values: t }, e, n) => {
  const s = i + e;
  n ? t[s >> 3] |= 1 << s % 8 : t[s >> 3] &= ~(1 << s % 8);
}, kt = ({ values: i }, t, e) => {
  i[t] = e;
}, In = ({ values: i }, t, e) => {
  i[t] = e;
}, sr = ({ values: i }, t, e) => {
  i[t] = Jo(e);
}, Xo = (i, t, e) => {
  switch (i.type.precision) {
    case K.HALF:
      return sr(i, t, e);
    case K.SINGLE:
    case K.DOUBLE:
      return In(i, t, e);
  }
}, rr = ({ values: i }, t, e) => {
  Qo(i, t, e.valueOf());
}, or = ({ values: i }, t, e) => {
  i[t] = BigInt(e);
}, ta = ({ stride: i, values: t }, e, n) => {
  t.set(n.subarray(0, i), i * e);
}, ar = ({ values: i, valueOffsets: t }, e, n) => nr(i, t, e, n), cr = ({ values: i, valueOffsets: t }, e, n) => nr(i, t, e, _n(n)), ea = (i, t, e) => {
  i.type.unit === yt.DAY ? rr(i, t, e) : or(i, t, e);
}, lr = ({ values: i }, t, e) => {
  i[t] = BigInt(e / 1e3);
}, ur = ({ values: i }, t, e) => {
  i[t] = BigInt(e);
}, dr = ({ values: i }, t, e) => {
  i[t] = BigInt(e * 1e3);
}, hr = ({ values: i }, t, e) => {
  i[t] = BigInt(e * 1e6);
}, ia = (i, t, e) => {
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
}, fr = ({ values: i }, t, e) => {
  i[t] = e;
}, yr = ({ values: i }, t, e) => {
  i[t] = e;
}, pr = ({ values: i }, t, e) => {
  i[t] = e;
}, mr = ({ values: i }, t, e) => {
  i[t] = e;
}, na = (i, t, e) => {
  switch (i.type.unit) {
    case g.SECOND:
      return fr(i, t, e);
    case g.MILLISECOND:
      return yr(i, t, e);
    case g.MICROSECOND:
      return pr(i, t, e);
    case g.NANOSECOND:
      return mr(i, t, e);
  }
}, sa = ({ values: i, stride: t }, e, n) => {
  i.set(n.subarray(0, t), t * e);
}, ra = (i, t, e) => {
  const n = i.children[0], s = i.valueOffsets, r = pt.getVisitFn(n);
  if (Array.isArray(e))
    for (let o = -1, a = s[t], c = s[t + 1]; a < c; )
      r(n, a++, e[++o]);
  else
    for (let o = -1, a = s[t], c = s[t + 1]; a < c; )
      r(n, a++, e.get(++o));
}, oa = (i, t, e) => {
  const n = i.children[0], { valueOffsets: s } = i, r = pt.getVisitFn(n);
  let { [t]: o, [t + 1]: a } = s;
  const c = e instanceof Map ? e.entries() : Object.entries(e);
  for (const u of c)
    if (r(n, o, u), ++o >= a)
      break;
}, aa = (i, t) => (e, n, s, r) => n && e(n, i, t[r]), ca = (i, t) => (e, n, s, r) => n && e(n, i, t.get(r)), la = (i, t) => (e, n, s, r) => n && e(n, i, t.get(s.name)), ua = (i, t) => (e, n, s, r) => n && e(n, i, t[s.name]), da = (i, t, e) => {
  const n = i.type.children.map((r) => pt.getVisitFn(r.type)), s = e instanceof Map ? la(t, e) : e instanceof R ? ca(t, e) : Array.isArray(e) ? aa(t, e) : ua(t, e);
  i.type.children.forEach((r, o) => s(n[o], i.children[o], r, o));
}, ha = (i, t, e) => {
  i.type.mode === J.Dense ? _r(i, t, e) : gr(i, t, e);
}, _r = (i, t, e) => {
  const n = i.type.typeIdToChildIndex[i.typeIds[t]], s = i.children[n];
  pt.visit(s, i.valueOffsets[t], e);
}, gr = (i, t, e) => {
  const n = i.type.typeIdToChildIndex[i.typeIds[t]], s = i.children[n];
  pt.visit(s, t, e);
}, fa = (i, t, e) => {
  var n;
  (n = i.dictionary) === null || n === void 0 || n.set(i.values[t], e);
}, ya = (i, t, e) => {
  i.type.unit === Et.DAY_TIME ? br(i, t, e) : wr(i, t, e);
}, br = ({ values: i }, t, e) => {
  i.set(e.subarray(0, 2), 2 * t);
}, wr = ({ values: i }, t, e) => {
  i[t] = e[0] * 12 + e[1] % 12;
}, Ir = ({ values: i }, t, e) => {
  i[t] = e;
}, vr = ({ values: i }, t, e) => {
  i[t] = e;
}, Sr = ({ values: i }, t, e) => {
  i[t] = e;
}, Br = ({ values: i }, t, e) => {
  i[t] = e;
}, pa = (i, t, e) => {
  switch (i.type.unit) {
    case g.SECOND:
      return Ir(i, t, e);
    case g.MILLISECOND:
      return vr(i, t, e);
    case g.MICROSECOND:
      return Sr(i, t, e);
    case g.NANOSECOND:
      return Br(i, t, e);
  }
}, ma = (i, t, e) => {
  const { stride: n } = i, s = i.children[0], r = pt.getVisitFn(s);
  if (Array.isArray(e))
    for (let o = -1, a = t * n; ++o < n; )
      r(s, a + o, e[o]);
  else
    for (let o = -1, a = t * n; ++o < n; )
      r(s, a + o, e.get(o));
};
b.prototype.visitBool = v(Zo);
b.prototype.visitInt = v(kt);
b.prototype.visitInt8 = v(kt);
b.prototype.visitInt16 = v(kt);
b.prototype.visitInt32 = v(kt);
b.prototype.visitInt64 = v(kt);
b.prototype.visitUint8 = v(kt);
b.prototype.visitUint16 = v(kt);
b.prototype.visitUint32 = v(kt);
b.prototype.visitUint64 = v(kt);
b.prototype.visitFloat = v(Xo);
b.prototype.visitFloat16 = v(sr);
b.prototype.visitFloat32 = v(In);
b.prototype.visitFloat64 = v(In);
b.prototype.visitUtf8 = v(cr);
b.prototype.visitLargeUtf8 = v(cr);
b.prototype.visitBinary = v(ar);
b.prototype.visitLargeBinary = v(ar);
b.prototype.visitFixedSizeBinary = v(ta);
b.prototype.visitDate = v(ea);
b.prototype.visitDateDay = v(rr);
b.prototype.visitDateMillisecond = v(or);
b.prototype.visitTimestamp = v(ia);
b.prototype.visitTimestampSecond = v(lr);
b.prototype.visitTimestampMillisecond = v(ur);
b.prototype.visitTimestampMicrosecond = v(dr);
b.prototype.visitTimestampNanosecond = v(hr);
b.prototype.visitTime = v(na);
b.prototype.visitTimeSecond = v(fr);
b.prototype.visitTimeMillisecond = v(yr);
b.prototype.visitTimeMicrosecond = v(pr);
b.prototype.visitTimeNanosecond = v(mr);
b.prototype.visitDecimal = v(sa);
b.prototype.visitList = v(ra);
b.prototype.visitStruct = v(da);
b.prototype.visitUnion = v(ha);
b.prototype.visitDenseUnion = v(_r);
b.prototype.visitSparseUnion = v(gr);
b.prototype.visitDictionary = v(fa);
b.prototype.visitInterval = v(ya);
b.prototype.visitIntervalDayTime = v(br);
b.prototype.visitIntervalYearMonth = v(wr);
b.prototype.visitDuration = v(pa);
b.prototype.visitDurationSecond = v(Ir);
b.prototype.visitDurationMillisecond = v(vr);
b.prototype.visitDurationMicrosecond = v(Sr);
b.prototype.visitDurationNanosecond = v(Br);
b.prototype.visitFixedSizeList = v(ma);
b.prototype.visitMap = v(oa);
const pt = new b(), gt = Symbol.for("parent"), ge = Symbol.for("rowIndex");
class vn {
  constructor(t, e) {
    return this[gt] = t, this[ge] = e, new Proxy(this, new ga());
  }
  toArray() {
    return Object.values(this.toJSON());
  }
  toJSON() {
    const t = this[ge], e = this[gt], n = e.type.children, s = {};
    for (let r = -1, o = n.length; ++r < o; )
      s[n[r].name] = rt.visit(e.children[r], t);
    return s;
  }
  toString() {
    return `{${[...this].map(([t, e]) => `${ke(t)}: ${ke(e)}`).join(", ")}}`;
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toString();
  }
  [Symbol.iterator]() {
    return new _a(this[gt], this[ge]);
  }
}
class _a {
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
        rt.visit(this.children[t], this.rowIndex)
      ]
    }) : { done: !0, value: null };
  }
}
Object.defineProperties(vn.prototype, {
  [Symbol.toStringTag]: { enumerable: !1, configurable: !1, value: "Row" },
  [gt]: { writable: !0, enumerable: !1, configurable: !1, value: null },
  [ge]: { writable: !0, enumerable: !1, configurable: !1, value: -1 }
});
class ga {
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
    return t[gt].type.children.map((e) => e.name);
  }
  has(t, e) {
    return t[gt].type.children.findIndex((n) => n.name === e) !== -1;
  }
  getOwnPropertyDescriptor(t, e) {
    if (t[gt].type.children.findIndex((n) => n.name === e) !== -1)
      return { writable: !0, enumerable: !0, configurable: !0 };
  }
  get(t, e) {
    if (Reflect.has(t, e))
      return t[e];
    const n = t[gt].type.children.findIndex((s) => s.name === e);
    if (n !== -1) {
      const s = rt.visit(t[gt].children[n], t[ge]);
      return Reflect.set(t, e, s), s;
    }
  }
  set(t, e, n) {
    const s = t[gt].type.children.findIndex((r) => r.name === e);
    return s !== -1 ? (pt.visit(t[gt].children[s], t[ge], n), Reflect.set(t, e, n)) : Reflect.has(t, e) || typeof e == "symbol" ? Reflect.set(t, e, n) : !1;
  }
}
class y extends A {
}
function w(i) {
  return (t, e) => t.getValid(e) ? i(t, e) : null;
}
const ba = (i, t) => 864e5 * i[t], wa = (i, t) => null, Dr = (i, t, e) => {
  if (e + 1 >= t.length)
    return null;
  const n = x(t[e]), s = x(t[e + 1]);
  return i.subarray(n, s);
}, Ia = ({ offset: i, values: t }, e) => {
  const n = i + e;
  return (t[n >> 3] & 1 << n % 8) !== 0;
}, Ar = ({ values: i }, t) => ba(i, t), Tr = ({ values: i }, t) => x(i[t]), Jt = ({ stride: i, values: t }, e) => t[i * e], va = ({ stride: i, values: t }, e) => ir(t[i * e]), Fr = ({ values: i }, t) => i[t], Sa = ({ stride: i, values: t }, e) => t.subarray(i * e, i * (e + 1)), Or = ({ values: i, valueOffsets: t }, e) => Dr(i, t, e), Er = ({ values: i, valueOffsets: t }, e) => {
  const n = Dr(i, t, e);
  return n !== null ? nn(n) : null;
}, Ba = ({ values: i }, t) => i[t], Da = ({ type: i, values: t }, e) => i.precision !== K.HALF ? t[e] : ir(t[e]), Aa = (i, t) => i.type.unit === yt.DAY ? Ar(i, t) : Tr(i, t), Nr = ({ values: i }, t) => 1e3 * x(i[t]), Rr = ({ values: i }, t) => x(i[t]), Lr = ({ values: i }, t) => Ns(i[t], BigInt(1e3)), Ur = ({ values: i }, t) => Ns(i[t], BigInt(1e6)), Ta = (i, t) => {
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
}, Mr = ({ values: i }, t) => i[t], Cr = ({ values: i }, t) => i[t], Pr = ({ values: i }, t) => i[t], kr = ({ values: i }, t) => i[t], Fa = (i, t) => {
  switch (i.type.unit) {
    case g.SECOND:
      return Mr(i, t);
    case g.MILLISECOND:
      return Cr(i, t);
    case g.MICROSECOND:
      return Pr(i, t);
    case g.NANOSECOND:
      return kr(i, t);
  }
}, Oa = ({ values: i, stride: t }, e) => wn.decimal(i.subarray(t * e, t * (e + 1))), Ea = (i, t) => {
  const { valueOffsets: e, stride: n, children: s } = i, { [t * n]: r, [t * n + 1]: o } = e, c = s[0].slice(r, o - r);
  return new R([c]);
}, Na = (i, t) => {
  const { valueOffsets: e, children: n } = i, { [t]: s, [t + 1]: r } = e, o = n[0];
  return new Sn(o.slice(s, r - s));
}, Ra = (i, t) => new vn(i, t), La = (i, t) => i.type.mode === J.Dense ? xr(i, t) : zr(i, t), xr = (i, t) => {
  const e = i.type.typeIdToChildIndex[i.typeIds[t]], n = i.children[e];
  return rt.visit(n, i.valueOffsets[t]);
}, zr = (i, t) => {
  const e = i.type.typeIdToChildIndex[i.typeIds[t]], n = i.children[e];
  return rt.visit(n, t);
}, Ua = (i, t) => {
  var e;
  return (e = i.dictionary) === null || e === void 0 ? void 0 : e.get(i.values[t]);
}, Ma = (i, t) => i.type.unit === Et.DAY_TIME ? Vr(i, t) : jr(i, t), Vr = ({ values: i }, t) => i.subarray(2 * t, 2 * (t + 1)), jr = ({ values: i }, t) => {
  const e = i[t], n = new Int32Array(2);
  return n[0] = Math.trunc(e / 12), n[1] = Math.trunc(e % 12), n;
}, $r = ({ values: i }, t) => i[t], Yr = ({ values: i }, t) => i[t], Wr = ({ values: i }, t) => i[t], Gr = ({ values: i }, t) => i[t], Ca = (i, t) => {
  switch (i.type.unit) {
    case g.SECOND:
      return $r(i, t);
    case g.MILLISECOND:
      return Yr(i, t);
    case g.MICROSECOND:
      return Wr(i, t);
    case g.NANOSECOND:
      return Gr(i, t);
  }
}, Pa = (i, t) => {
  const { stride: e, children: n } = i, r = n[0].slice(t * e, e);
  return new R([r]);
};
y.prototype.visitNull = w(wa);
y.prototype.visitBool = w(Ia);
y.prototype.visitInt = w(Ba);
y.prototype.visitInt8 = w(Jt);
y.prototype.visitInt16 = w(Jt);
y.prototype.visitInt32 = w(Jt);
y.prototype.visitInt64 = w(Fr);
y.prototype.visitUint8 = w(Jt);
y.prototype.visitUint16 = w(Jt);
y.prototype.visitUint32 = w(Jt);
y.prototype.visitUint64 = w(Fr);
y.prototype.visitFloat = w(Da);
y.prototype.visitFloat16 = w(va);
y.prototype.visitFloat32 = w(Jt);
y.prototype.visitFloat64 = w(Jt);
y.prototype.visitUtf8 = w(Er);
y.prototype.visitLargeUtf8 = w(Er);
y.prototype.visitBinary = w(Or);
y.prototype.visitLargeBinary = w(Or);
y.prototype.visitFixedSizeBinary = w(Sa);
y.prototype.visitDate = w(Aa);
y.prototype.visitDateDay = w(Ar);
y.prototype.visitDateMillisecond = w(Tr);
y.prototype.visitTimestamp = w(Ta);
y.prototype.visitTimestampSecond = w(Nr);
y.prototype.visitTimestampMillisecond = w(Rr);
y.prototype.visitTimestampMicrosecond = w(Lr);
y.prototype.visitTimestampNanosecond = w(Ur);
y.prototype.visitTime = w(Fa);
y.prototype.visitTimeSecond = w(Mr);
y.prototype.visitTimeMillisecond = w(Cr);
y.prototype.visitTimeMicrosecond = w(Pr);
y.prototype.visitTimeNanosecond = w(kr);
y.prototype.visitDecimal = w(Oa);
y.prototype.visitList = w(Ea);
y.prototype.visitStruct = w(Ra);
y.prototype.visitUnion = w(La);
y.prototype.visitDenseUnion = w(xr);
y.prototype.visitSparseUnion = w(zr);
y.prototype.visitDictionary = w(Ua);
y.prototype.visitInterval = w(Ma);
y.prototype.visitIntervalDayTime = w(Vr);
y.prototype.visitIntervalYearMonth = w(jr);
y.prototype.visitDuration = w(Ca);
y.prototype.visitDurationSecond = w($r);
y.prototype.visitDurationMillisecond = w(Yr);
y.prototype.visitDurationMicrosecond = w(Wr);
y.prototype.visitDurationNanosecond = w(Gr);
y.prototype.visitFixedSizeList = w(Pa);
y.prototype.visitMap = w(Na);
const rt = new y(), fe = Symbol.for("keys"), be = Symbol.for("vals"), ye = Symbol.for("kKeysAsStrings"), ln = Symbol.for("_kKeysAsStrings");
class Sn {
  constructor(t) {
    return this[fe] = new R([t.children[0]]).memoize(), this[be] = t.children[1], new Proxy(this, new xa());
  }
  /** @ignore */
  get [ye]() {
    return this[ln] || (this[ln] = Array.from(this[fe].toArray(), String));
  }
  [Symbol.iterator]() {
    return new ka(this[fe], this[be]);
  }
  get size() {
    return this[fe].length;
  }
  toArray() {
    return Object.values(this.toJSON());
  }
  toJSON() {
    const t = this[fe], e = this[be], n = {};
    for (let s = -1, r = t.length; ++s < r; )
      n[t.get(s)] = rt.visit(e, s);
    return n;
  }
  toString() {
    return `{${[...this].map(([t, e]) => `${ke(t)}: ${ke(e)}`).join(", ")}}`;
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toString();
  }
}
class ka {
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
        rt.visit(this.vals, t)
      ]
    });
  }
}
class xa {
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
    return t[ye];
  }
  has(t, e) {
    return t[ye].includes(e);
  }
  getOwnPropertyDescriptor(t, e) {
    if (t[ye].indexOf(e) !== -1)
      return { writable: !0, enumerable: !0, configurable: !0 };
  }
  get(t, e) {
    if (Reflect.has(t, e))
      return t[e];
    const n = t[ye].indexOf(e);
    if (n !== -1) {
      const s = rt.visit(Reflect.get(t, be), n);
      return Reflect.set(t, e, s), s;
    }
  }
  set(t, e, n) {
    const s = t[ye].indexOf(e);
    return s !== -1 ? (pt.visit(Reflect.get(t, be), s, n), Reflect.set(t, e, n)) : Reflect.has(t, e) ? Reflect.set(t, e, n) : !1;
  }
}
Object.defineProperties(Sn.prototype, {
  [Symbol.toStringTag]: { enumerable: !1, configurable: !1, value: "Row" },
  [fe]: { writable: !0, enumerable: !1, configurable: !1, value: null },
  [be]: { writable: !0, enumerable: !1, configurable: !1, value: null },
  [ln]: { writable: !0, enumerable: !1, configurable: !1, value: null }
});
let ss;
function Hr(i, t, e, n) {
  const { length: s = 0 } = i;
  let r = typeof t != "number" ? 0 : t, o = typeof e != "number" ? s : e;
  return r < 0 && (r = (r % s + s) % s), o < 0 && (o = (o % s + s) % s), o < r && (ss = r, r = o, o = ss), o > s && (o = s), n ? n(i, r, o) : [r, o];
}
const Bn = (i, t) => i < 0 ? t + i : i, rs = (i) => i !== i;
function Ae(i) {
  if (typeof i !== "object" || i === null)
    return rs(i) ? rs : (e) => e === i;
  if (i instanceof Date) {
    const e = i.valueOf();
    return (n) => n instanceof Date ? n.valueOf() === e : !1;
  }
  return ArrayBuffer.isView(i) ? (e) => e ? Po(i, e) : !1 : i instanceof Map ? Va(i) : Array.isArray(i) ? za(i) : i instanceof R ? ja(i) : $a(i, !0);
}
function za(i) {
  const t = [];
  for (let e = -1, n = i.length; ++e < n; )
    t[e] = Ae(i[e]);
  return $i(t);
}
function Va(i) {
  let t = -1;
  const e = [];
  for (const n of i.values())
    e[++t] = Ae(n);
  return $i(e);
}
function ja(i) {
  const t = [];
  for (let e = -1, n = i.length; ++e < n; )
    t[e] = Ae(i.get(e));
  return $i(t);
}
function $a(i, t = !1) {
  const e = Object.keys(i);
  if (!t && e.length === 0)
    return () => !1;
  const n = [];
  for (let s = -1, r = e.length; ++s < r; )
    n[s] = Ae(i[e[s]]);
  return $i(n, e);
}
function $i(i, t) {
  return (e) => {
    if (!e || typeof e != "object")
      return !1;
    switch (e.constructor) {
      case Array:
        return Ya(i, e);
      case Map:
        return os(i, e, e.keys());
      case Sn:
      case vn:
      case Object:
      case void 0:
        return os(i, e, t || Object.keys(e));
    }
    return e instanceof R ? Wa(i, e) : !1;
  };
}
function Ya(i, t) {
  const e = i.length;
  if (t.length !== e)
    return !1;
  for (let n = -1; ++n < e; )
    if (!i[n](t[n]))
      return !1;
  return !0;
}
function Wa(i, t) {
  const e = i.length;
  if (t.length !== e)
    return !1;
  for (let n = -1; ++n < e; )
    if (!i[n](t.get(n)))
      return !1;
  return !0;
}
function os(i, t, e) {
  const n = e[Symbol.iterator](), s = t instanceof Map ? t.keys() : Object.keys(t)[Symbol.iterator](), r = t instanceof Map ? t.values() : Object.values(t)[Symbol.iterator]();
  let o = 0;
  const a = i.length;
  let c = r.next(), u = n.next(), d = s.next();
  for (; o < a && !u.done && !d.done && !c.done && !(u.value !== d.value || !i[o](c.value)); ++o, u = n.next(), d = s.next(), c = r.next())
    ;
  return o === a && u.done && d.done && c.done ? !0 : (n.return && n.return(), s.return && s.return(), r.return && r.return(), !1);
}
function qr(i, t, e, n) {
  return (e & 1 << n) !== 0;
}
function Ga(i, t, e, n) {
  return (e & 1 << n) >> n;
}
function Ni(i, t, e) {
  const n = e.byteLength + 7 & -8;
  if (i > 0 || e.byteLength < n) {
    const s = new Uint8Array(n);
    return s.set(i % 8 === 0 ? e.subarray(i >> 3) : (
      // Otherwise iterate each bit from the offset and return a new one
      Ri(new Dn(e, i, t, null, qr)).subarray(0, n)
    )), s;
  }
  return e;
}
function Ri(i) {
  const t = [];
  let e = 0, n = 0, s = 0;
  for (const o of i)
    o && (s |= 1 << n), ++n === 8 && (t[e++] = s, s = n = 0);
  (e === 0 || n > 0) && (t[e++] = s);
  const r = new Uint8Array(t.length + 7 & -8);
  return r.set(t), r;
}
class Dn {
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
function un(i, t, e) {
  if (e - t <= 0)
    return 0;
  if (e - t < 8) {
    let r = 0;
    for (const o of new Dn(i, t, e - t, i, Ga))
      r += o;
    return r;
  }
  const n = e >> 3 << 3, s = t + (t % 8 === 0 ? 0 : 8 - t % 8);
  return (
    // Get the popcnt of bits between the left hand side, and the next highest multiple of 8
    un(i, t, s) + // Get the popcnt of bits between the right hand side, and the next lowest multiple of 8
    un(i, n, e) + // Get the popcnt of all bits between the left and right hand sides' multiples of 8
    Ha(i, s >> 3, n - s >> 3)
  );
}
function Ha(i, t, e) {
  let n = 0, s = Math.trunc(t);
  const r = new DataView(i.buffer, i.byteOffset, i.byteLength), o = e === void 0 ? i.byteLength : s + e;
  for (; o - s >= 4; )
    n += Ji(r.getUint32(s)), s += 4;
  for (; o - s >= 2; )
    n += Ji(r.getUint16(s)), s += 2;
  for (; o - s >= 1; )
    n += Ji(r.getUint8(s)), s += 1;
  return n;
}
function Ji(i) {
  let t = Math.trunc(i);
  return t = t - (t >>> 1 & 1431655765), t = (t & 858993459) + (t >>> 2 & 858993459), (t + (t >>> 4) & 252645135) * 16843009 >>> 24;
}
const qa = -1;
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
    return t <= qa && (e = this.nullBitmap) && (this._nullCount = t = e.length === 0 ? (
      // no null bitmap, so all values are valid
      0
    ) : this.length - un(e, this.offset, this.offset + this.length)), t;
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
      (!r || r.byteLength <= d) && (r = new Uint8Array((o + a + 63 & -64) >> 3).fill(255), this.nullCount > 0 ? (r.set(Ni(o, a, this.nullBitmap), 0), Object.assign(this, { nullBitmap: r })) : Object.assign(this, { nullBitmap: r, _nullCount: 0 }));
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
    s[e >> 3] = (1 << e - (e & -8)) - 1, n > 0 && s.set(Ni(this.offset, e, this.nullBitmap), 0);
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
class Pe extends A {
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
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.data), r = O(t.nullBitmap), o = Fe(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, s, r]);
  }
  visitLargeUtf8(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.data), r = O(t.nullBitmap), o = Hn(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, s, r]);
  }
  visitBinary(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.data), r = O(t.nullBitmap), o = Fe(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, s, r]);
  }
  visitLargeBinary(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.data), r = O(t.nullBitmap), o = Hn(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
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
    const { ["type"]: e, ["offset"]: n = 0, ["child"]: s } = t, r = O(t.nullBitmap), o = Fe(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
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
    const c = Fe(t.valueOffsets);
    return new M(e, n, o, a, [c, void 0, void 0, r], s);
  }
  visitDictionary(t) {
    const { ["type"]: e, ["offset"]: n = 0 } = t, s = O(t.nullBitmap), r = P(e.indices.ArrayType, t.data), { ["dictionary"]: o = new R([new Pe().visit({ type: e.dictionary })]) } = t, { ["length"]: a = r.length, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
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
    const { ["type"]: e, ["offset"]: n = 0, ["child"]: s = new Pe().visit({ type: e.valueType }) } = t, r = O(t.nullBitmap), { ["length"]: o = s.length / Mt(e), ["nullCount"]: a = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, o, a, [void 0, void 0, r], [s]);
  }
  visitMap(t) {
    const { ["type"]: e, ["offset"]: n = 0, ["child"]: s = new Pe().visit({ type: e.childType }) } = t, r = O(t.nullBitmap), o = Fe(t.valueOffsets), { ["length"]: a = o.length - 1, ["nullCount"]: c = t.nullBitmap ? -1 : 0 } = t;
    return new M(e, n, a, c, [o, void 0, r], [s]);
  }
}
const Ka = new Pe();
function T(i) {
  return Ka.visit(i);
}
class as {
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
function Ja(i) {
  return i.some((t) => t.nullable);
}
function Kr(i) {
  return i.reduce((t, e) => t + e.nullCount, 0);
}
function Jr(i) {
  return i.reduce((t, e, n) => (t[n + 1] = t[n] + e.length, t), new Uint32Array(i.length + 1));
}
function Qr(i, t, e, n) {
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
function An(i, t, e, n) {
  let s = 0, r = 0, o = t.length - 1;
  do {
    if (s >= o - 1)
      return e < t[o] ? n(i, s, e - t[s]) : null;
    r = s + Math.trunc((o - s) * 0.5), e < t[r] ? o = r : s = r;
  } while (s < o);
}
function Tn(i, t) {
  return i.getValid(t);
}
function Li(i) {
  function t(e, n, s) {
    return i(e[n], s);
  }
  return function(e) {
    const n = this.data;
    return An(n, this._offsets, e, t);
  };
}
function Zr(i) {
  let t;
  function e(n, s, r) {
    return i(n[s], r, t);
  }
  return function(n, s) {
    const r = this.data;
    t = s;
    const o = An(r, this._offsets, n, e);
    return t = void 0, o;
  };
}
function Xr(i) {
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
    const r = this.data, o = typeof s != "number" ? e(r, 0, 0) : An(r, this._offsets, s, e);
    return t = void 0, o;
  };
}
class p extends A {
}
function Qa(i, t) {
  return t === null && i.length > 0 ? 0 : -1;
}
function Za(i, t) {
  const { nullBitmap: e } = i;
  if (!e || i.nullCount <= 0)
    return -1;
  let n = 0;
  for (const s of new Dn(e, i.offset + (t || 0), i.length, e, qr)) {
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
        return Za(i, e);
    }
  const n = rt.getVisitFn(i), s = Ae(t);
  for (let r = (e || 0) - 1, o = i.length; ++r < o; )
    if (s(n(i, r)))
      return r;
  return -1;
}
function to(i, t, e) {
  const n = rt.getVisitFn(i), s = Ae(t);
  for (let r = (e || 0) - 1, o = i.length; ++r < o; )
    if (s(n(i, r)))
      return r;
  return -1;
}
p.prototype.visitNull = Qa;
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
p.prototype.visitDenseUnion = to;
p.prototype.visitSparseUnion = to;
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
const Ui = new p();
class m extends A {
}
function I(i) {
  const { type: t } = i;
  if (i.nullCount === 0 && i.stride === 1 && // Don't defer to native iterator for timestamps since Numbers are expected
  // (DataType.isTimestamp(type)) && type.unit === TimeUnit.MILLISECOND ||
  (f.isInt(t) && t.bitWidth !== 64 || f.isTime(t) && t.bitWidth !== 64 || f.isFloat(t) && t.precision !== K.HALF))
    return new as(i.data.length, (n) => {
      const s = i.data[n];
      return s.values.subarray(0, s.length)[Symbol.iterator]();
    });
  let e = 0;
  return new as(i.data.length, (n) => {
    const r = i.data[n].length, o = i.slice(e, e + r);
    return e += r, new Xa(o);
  });
}
class Xa {
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
m.prototype.visitNull = I;
m.prototype.visitBool = I;
m.prototype.visitInt = I;
m.prototype.visitInt8 = I;
m.prototype.visitInt16 = I;
m.prototype.visitInt32 = I;
m.prototype.visitInt64 = I;
m.prototype.visitUint8 = I;
m.prototype.visitUint16 = I;
m.prototype.visitUint32 = I;
m.prototype.visitUint64 = I;
m.prototype.visitFloat = I;
m.prototype.visitFloat16 = I;
m.prototype.visitFloat32 = I;
m.prototype.visitFloat64 = I;
m.prototype.visitUtf8 = I;
m.prototype.visitLargeUtf8 = I;
m.prototype.visitBinary = I;
m.prototype.visitLargeBinary = I;
m.prototype.visitFixedSizeBinary = I;
m.prototype.visitDate = I;
m.prototype.visitDateDay = I;
m.prototype.visitDateMillisecond = I;
m.prototype.visitTimestamp = I;
m.prototype.visitTimestampSecond = I;
m.prototype.visitTimestampMillisecond = I;
m.prototype.visitTimestampMicrosecond = I;
m.prototype.visitTimestampNanosecond = I;
m.prototype.visitTime = I;
m.prototype.visitTimeSecond = I;
m.prototype.visitTimeMillisecond = I;
m.prototype.visitTimeMicrosecond = I;
m.prototype.visitTimeNanosecond = I;
m.prototype.visitDecimal = I;
m.prototype.visitList = I;
m.prototype.visitStruct = I;
m.prototype.visitUnion = I;
m.prototype.visitDenseUnion = I;
m.prototype.visitSparseUnion = I;
m.prototype.visitDictionary = I;
m.prototype.visitInterval = I;
m.prototype.visitIntervalDayTime = I;
m.prototype.visitIntervalYearMonth = I;
m.prototype.visitDuration = I;
m.prototype.visitDurationSecond = I;
m.prototype.visitDurationMillisecond = I;
m.prototype.visitDurationMicrosecond = I;
m.prototype.visitDurationNanosecond = I;
m.prototype.visitFixedSizeList = I;
m.prototype.visitMap = I;
const Fn = new m();
var eo;
const io = {}, no = {};
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
        const { get: a, set: c, indexOf: u } = io[o.typeId], d = r[0];
        this.isValid = (h) => Tn(d, h), this.get = (h) => a(d, h), this.set = (h, V) => c(d, h, V), this.indexOf = (h) => u(d, h), this._offsets = [0, d.length];
        break;
      }
      default:
        Object.setPrototypeOf(this, no[o.typeId]), this._offsets = Jr(r);
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
    return Ja(this.data);
  }
  /**
   * The number of null elements in this Vector.
   */
  get nullCount() {
    return Kr(this.data);
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
    return this.get(Bn(t, this.length));
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
    return Fn.visit(this);
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
    return new R(Hr(this, t, e, ({ data: n, _offsets: s }, r, o) => Qr(n, s, r, o)));
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
      const t = new Mi(this.data[0].dictionary), e = this.data.map((n) => {
        const s = n.clone();
        return s.dictionary = t, s;
      });
      return new R(e);
    }
    return new Mi(this);
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
eo = Symbol.toStringTag;
R[eo] = ((i) => {
  i.type = f.prototype, i.data = [], i.length = 0, i.stride = 1, i.numChildren = 0, i._offsets = new Uint32Array([0]), i[Symbol.isConcatSpreadable] = !0;
  const t = Object.keys(l).map((e) => l[e]).filter((e) => typeof e == "number" && e !== l.NONE);
  for (const e of t) {
    const n = rt.getVisitFnByTypeId(e), s = pt.getVisitFnByTypeId(e), r = Ui.getVisitFnByTypeId(e);
    io[e] = { get: n, set: s, indexOf: r }, no[e] = Object.create(i, {
      isValid: { value: Li(Tn) },
      get: { value: Li(rt.getVisitFnByTypeId(e)) },
      set: { value: Zr(pt.getVisitFnByTypeId(e)) },
      indexOf: { value: Xr(Ui.getVisitFnByTypeId(e)) }
    });
  }
  return "Vector";
})(R.prototype);
class Mi extends R {
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
      value: (o, a) => new Mi(s.call(this, o, a))
    }), Object.defineProperty(this, "isMemoized", { value: !0 }), Object.defineProperty(this, "unmemoize", {
      value: () => new R(this.data)
    }), Object.defineProperty(this, "memoize", {
      value: () => this
    });
  }
}
class dn {
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
class ot {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsFooter(t, e) {
    return (e || new ot()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsFooter(t, e) {
    return t.setPosition(t.position() + U), (e || new ot()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  version() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : W.V1;
  }
  schema(t) {
    const e = this.bb.__offset(this.bb_pos, 6);
    return e ? (t || new vt()).__init(this.bb.__indirect(this.bb_pos + e), this.bb) : null;
  }
  dictionaries(t, e) {
    const n = this.bb.__offset(this.bb_pos, 8);
    return n ? (e || new dn()).__init(this.bb.__vector(this.bb_pos + n) + t * 24, this.bb) : null;
  }
  dictionariesLength() {
    const t = this.bb.__offset(this.bb_pos, 8);
    return t ? this.bb.__vector_len(this.bb_pos + t) : 0;
  }
  recordBatches(t, e) {
    const n = this.bb.__offset(this.bb_pos, 10);
    return n ? (e || new dn()).__init(this.bb.__vector(this.bb_pos + n) + t * 24, this.bb) : null;
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
    t.addFieldInt16(0, e, W.V1);
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
  constructor(t = [], e, n, s = W.V5) {
    this.fields = t || [], this.metadata = e || /* @__PURE__ */ new Map(), n || (n = hn(this.fields)), this.dictionaries = n, this.metadataVersion = s;
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
    const e = t[0] instanceof L ? t[0] : Array.isArray(t[0]) ? new L(t[0]) : new L(t), n = [...this.fields], s = Ze(Ze(/* @__PURE__ */ new Map(), this.metadata), e.metadata), r = e.fields.filter((a) => {
      const c = n.findIndex((u) => u.name === a.name);
      return ~c ? (n[c] = a.clone({
        metadata: Ze(Ze(/* @__PURE__ */ new Map(), n[c].metadata), a.metadata)
      })) && !1 : !0;
    }), o = hn(r, /* @__PURE__ */ new Map());
    return new L([...n, ...r], s, new Map([...this.dictionaries, ...o]));
  }
}
L.prototype.fields = null;
L.prototype.metadata = null;
L.prototype.dictionaries = null;
class j {
  /** @nocollapse */
  static new(...t) {
    let [e, n, s, r] = t;
    return t[0] && typeof t[0] == "object" && ({ name: e } = t[0], n === void 0 && (n = t[0].type), s === void 0 && (s = t[0].nullable), r === void 0 && (r = t[0].metadata)), new j(`${e}`, n, s, r);
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
    return !t[0] || typeof t[0] != "object" ? [e = this.name, n = this.type, s = this.nullable, r = this.metadata] = t : { name: e = this.name, type: n = this.type, nullable: s = this.nullable, metadata: r = this.metadata } = t[0], j.new(e, n, s, r);
  }
}
j.prototype.type = null;
j.prototype.name = null;
j.prototype.nullable = null;
j.prototype.metadata = null;
function Ze(i, t) {
  return new Map([...i || /* @__PURE__ */ new Map(), ...t || /* @__PURE__ */ new Map()]);
}
function hn(i, t = /* @__PURE__ */ new Map()) {
  for (let e = -1, n = i.length; ++e < n; ) {
    const r = i[e].type;
    if (f.isDictionary(r)) {
      if (!t.has(r.id))
        t.set(r.id, r.dictionary);
      else if (t.get(r.id) !== r.dictionary)
        throw new Error("Cannot create Schema containing two different dictionaries with the same Id");
    }
    r.children && r.children.length > 0 && hn(r.children, t);
  }
  return t;
}
var tc = Ts, ec = we;
class je {
  /** @nocollapse */
  static decode(t) {
    t = new ec(O(t));
    const e = ot.getRootAsFooter(t), n = L.decode(e.schema(), /* @__PURE__ */ new Map(), e.version());
    return new ic(n, e);
  }
  /** @nocollapse */
  static encode(t) {
    const e = new tc(), n = L.encode(e, t.schema);
    ot.startRecordBatchesVector(e, t.numRecordBatches);
    for (const o of [...t.recordBatches()].slice().reverse())
      Ht.encode(e, o);
    const s = e.endVector();
    ot.startDictionariesVector(e, t.numDictionaries);
    for (const o of [...t.dictionaryBatches()].slice().reverse())
      Ht.encode(e, o);
    const r = e.endVector();
    return ot.startFooter(e), ot.addSchema(e, n), ot.addVersion(e, W.V5), ot.addRecordBatches(e, s), ot.addDictionaries(e, r), ot.finishFooterBuffer(e, ot.endFooter(e)), e.asUint8Array();
  }
  get numRecordBatches() {
    return this._recordBatches.length;
  }
  get numDictionaries() {
    return this._dictionaryBatches.length;
  }
  constructor(t, e = W.V5, n, s) {
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
class ic extends je {
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
    return dn.createBlock(t, s, n, r);
  }
  constructor(t, e, n) {
    this.metaDataLength = t, this.offset = x(n), this.bodyLength = x(e);
  }
}
const $ = Object.freeze({ done: !0, value: void 0 });
class cs {
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
class On {
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
class nc extends On {
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
    return ut.toDOMStream(this._closedPromiseResolve || this._error ? this : this._values, t);
  }
  toNodeStream(t) {
    return ut.toNodeStream(this._closedPromiseResolve || this._error ? this : this._values, t);
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
class ai extends nc {
  write(t) {
    if ((t = O(t)).byteLength > 0)
      return super.write(t);
  }
  toString(t = !1) {
    return t ? nn(this.toUint8Array(!0)) : this.toUint8Array(!1).then(nn);
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
class Ci {
  constructor(t) {
    t && (this.source = new sc(ut.fromIterable(t)));
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
class Se {
  constructor(t) {
    t instanceof Se ? this.source = t.source : t instanceof ai ? this.source = new Qt(ut.fromAsyncIterable(t)) : Ss(t) ? this.source = new Qt(ut.fromNodeStream(t)) : gn(t) ? this.source = new Qt(ut.fromDOMStream(t)) : vs(t) ? this.source = new Qt(ut.fromDOMStream(t.body)) : We(t) ? this.source = new Qt(ut.fromIterable(t)) : te(t) ? this.source = new Qt(ut.fromAsyncIterable(t)) : De(t) && (this.source = new Qt(ut.fromAsyncIterable(t)));
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
class sc {
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
class Qt {
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
class ls extends Ci {
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
class Pi extends Se {
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
const rc = 65536;
function pe(i) {
  return i < 0 && (i = 4294967295 + i + 1), `0x${i.toString(16)}`;
}
const Be = 8, En = [
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
class so {
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
    return s = e[2] * n[3], r += s, s = e[3] * n[2] >>> 0, r += s, this.buffer[0] += r << 16, this.buffer[1] = r >>> 0 < s ? rc : 0, this.buffer[1] += r >>> 16, this.buffer[1] += e[1] * n[3] + e[2] * n[2] + e[3] * n[1], this.buffer[1] += e[0] * n[3] + e[1] * n[2] + e[2] * n[1] + e[3] * n[0] << 16, this;
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
    return `${pe(this.buffer[1])} ${pe(this.buffer[0])}`;
  }
}
class C extends so {
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
      const o = Be < n - r ? Be : n - r, a = new C(new Uint32Array([Number.parseInt(t.slice(r, r + o), 10), 0])), c = new C(new Uint32Array([En[o], 0]));
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
class et extends so {
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
    return et.fromString(typeof t == "string" ? t : t.toString(), e);
  }
  /** @nocollapse */
  static fromNumber(t, e = new Uint32Array(2)) {
    return et.fromString(t.toString(), e);
  }
  /** @nocollapse */
  static fromString(t, e = new Uint32Array(2)) {
    const n = t.startsWith("-"), s = t.length, r = new et(e);
    for (let o = n ? 1 : 0; o < s; ) {
      const a = Be < s - o ? Be : s - o, c = new et(new Uint32Array([Number.parseInt(t.slice(o, o + a), 10), 0])), u = new et(new Uint32Array([En[a], 0]));
      r.times(u), r.plus(c), o += a;
    }
    return n ? r.negate() : r;
  }
  /** @nocollapse */
  static convertArray(t) {
    const e = new Uint32Array(t.length * 2);
    for (let n = -1, s = t.length; ++n < s; )
      et.from(t[n], new Uint32Array(e.buffer, e.byteOffset + 2 * n * 4, 2));
    return e;
  }
  /** @nocollapse */
  static multiply(t, e) {
    return new et(new Uint32Array(t.buffer)).times(e);
  }
  /** @nocollapse */
  static add(t, e) {
    return new et(new Uint32Array(t.buffer)).plus(e);
  }
}
class St {
  constructor(t) {
    this.buffer = t;
  }
  high() {
    return new et(new Uint32Array(this.buffer.buffer, this.buffer.byteOffset + 8, 2));
  }
  low() {
    return new et(new Uint32Array(this.buffer.buffer, this.buffer.byteOffset, 2));
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
    return `${pe(this.buffer[3])} ${pe(this.buffer[2])} ${pe(this.buffer[1])} ${pe(this.buffer[0])}`;
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
      const a = Be < s - o ? Be : s - o, c = new St(new Uint32Array([Number.parseInt(t.slice(o, o + a), 10), 0, 0, 0])), u = new St(new Uint32Array([En[a], 0, 0, 0]));
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
class ro extends A {
  constructor(t, e, n, s, r = W.V5) {
    super(), this.nodesIndex = -1, this.buffersIndex = -1, this.bytes = t, this.nodes = e, this.buffers = n, this.dictionaries = s, this.metadataVersion = r;
  }
  visit(t) {
    return super.visit(t instanceof j ? t.type : t);
  }
  visitNull(t, { length: e } = this.nextFieldNode()) {
    return T({ type: t, length: e });
  }
  visitBool(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitInt(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitFloat(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitUtf8(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), valueOffsets: this.readOffsets(t), data: this.readData(t) });
  }
  visitLargeUtf8(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), valueOffsets: this.readOffsets(t), data: this.readData(t) });
  }
  visitBinary(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), valueOffsets: this.readOffsets(t), data: this.readData(t) });
  }
  visitLargeBinary(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), valueOffsets: this.readOffsets(t), data: this.readData(t) });
  }
  visitFixedSizeBinary(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitDate(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitTimestamp(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitTime(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitDecimal(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitList(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), valueOffsets: this.readOffsets(t), child: this.visit(t.children[0]) });
  }
  visitStruct(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), children: this.visitMany(t.children) });
  }
  visitUnion(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return this.metadataVersion < W.V5 && this.readNullBitmap(t, n), t.mode === J.Sparse ? this.visitSparseUnion(t, { length: e, nullCount: n }) : this.visitDenseUnion(t, { length: e, nullCount: n });
  }
  visitDenseUnion(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, typeIds: this.readTypeIds(t), valueOffsets: this.readOffsets(t), children: this.visitMany(t.children) });
  }
  visitSparseUnion(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, typeIds: this.readTypeIds(t), children: this.visitMany(t.children) });
  }
  visitDictionary(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t.indices), dictionary: this.readDictionary(t) });
  }
  visitInterval(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitDuration(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), data: this.readData(t) });
  }
  visitFixedSizeList(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), child: this.visit(t.children[0]) });
  }
  visitMap(t, { length: e, nullCount: n } = this.nextFieldNode()) {
    return T({ type: t, length: e, nullCount: n, nullBitmap: this.readNullBitmap(t, n), valueOffsets: this.readOffsets(t), child: this.visit(t.children[0]) });
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
class oc extends ro {
  constructor(t, e, n, s, r) {
    super(new Uint8Array(0), e, n, s, r), this.sources = t;
  }
  readNullBitmap(t, e, { offset: n } = this.nextBufferRange()) {
    return e <= 0 ? new Uint8Array(0) : Ri(this.sources[n]);
  }
  readOffsets(t, { offset: e } = this.nextBufferRange()) {
    return P(Uint8Array, P(t.OffsetArrayType, this.sources[e]));
  }
  readTypeIds(t, { offset: e } = this.nextBufferRange()) {
    return P(Uint8Array, P(t.ArrayType, this.sources[e]));
  }
  readData(t, { offset: e } = this.nextBufferRange()) {
    const { sources: n } = this;
    return f.isTimestamp(t) || (f.isInt(t) || f.isTime(t)) && t.bitWidth === 64 || f.isDuration(t) || f.isDate(t) && t.unit === yt.MILLISECOND ? P(Uint8Array, et.convertArray(n[e])) : f.isDecimal(t) ? P(Uint8Array, St.convertArray(n[e])) : f.isBinary(t) || f.isLargeBinary(t) || f.isFixedSizeBinary(t) ? ac(n[e]) : f.isBool(t) ? Ri(n[e]) : f.isUtf8(t) || f.isLargeUtf8(t) ? _n(n[e].join("")) : P(Uint8Array, P(t.ArrayType, n[e].map((s) => +s)));
  }
}
function ac(i) {
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
function tt(i, t) {
  return t instanceof i.constructor;
}
function ie(i, t) {
  return i === t || tt(i, t);
}
function xt(i, t) {
  return i === t || tt(i, t) && i.bitWidth === t.bitWidth && i.isSigned === t.isSigned;
}
function Yi(i, t) {
  return i === t || tt(i, t) && i.precision === t.precision;
}
function cc(i, t) {
  return i === t || tt(i, t) && i.byteWidth === t.byteWidth;
}
function Nn(i, t) {
  return i === t || tt(i, t) && i.unit === t.unit;
}
function Ge(i, t) {
  return i === t || tt(i, t) && i.unit === t.unit && i.timezone === t.timezone;
}
function He(i, t) {
  return i === t || tt(i, t) && i.unit === t.unit && i.bitWidth === t.bitWidth;
}
function lc(i, t) {
  return i === t || tt(i, t) && i.children.length === t.children.length && qt.compareManyFields(i.children, t.children);
}
function uc(i, t) {
  return i === t || tt(i, t) && i.children.length === t.children.length && qt.compareManyFields(i.children, t.children);
}
function Rn(i, t) {
  return i === t || tt(i, t) && i.mode === t.mode && i.typeIds.every((e, n) => e === t.typeIds[n]) && qt.compareManyFields(i.children, t.children);
}
function dc(i, t) {
  return i === t || tt(i, t) && i.id === t.id && i.isOrdered === t.isOrdered && qt.visit(i.indices, t.indices) && qt.visit(i.dictionary, t.dictionary);
}
function Ln(i, t) {
  return i === t || tt(i, t) && i.unit === t.unit;
}
function qe(i, t) {
  return i === t || tt(i, t) && i.unit === t.unit;
}
function hc(i, t) {
  return i === t || tt(i, t) && i.listSize === t.listSize && i.children.length === t.children.length && qt.compareManyFields(i.children, t.children);
}
function fc(i, t) {
  return i === t || tt(i, t) && i.keysSorted === t.keysSorted && i.children.length === t.children.length && qt.compareManyFields(i.children, t.children);
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
_.prototype.visitFloat = Yi;
_.prototype.visitFloat16 = Yi;
_.prototype.visitFloat32 = Yi;
_.prototype.visitFloat64 = Yi;
_.prototype.visitUtf8 = ie;
_.prototype.visitLargeUtf8 = ie;
_.prototype.visitBinary = ie;
_.prototype.visitLargeBinary = ie;
_.prototype.visitFixedSizeBinary = cc;
_.prototype.visitDate = Nn;
_.prototype.visitDateDay = Nn;
_.prototype.visitDateMillisecond = Nn;
_.prototype.visitTimestamp = Ge;
_.prototype.visitTimestampSecond = Ge;
_.prototype.visitTimestampMillisecond = Ge;
_.prototype.visitTimestampMicrosecond = Ge;
_.prototype.visitTimestampNanosecond = Ge;
_.prototype.visitTime = He;
_.prototype.visitTimeSecond = He;
_.prototype.visitTimeMillisecond = He;
_.prototype.visitTimeMicrosecond = He;
_.prototype.visitTimeNanosecond = He;
_.prototype.visitDecimal = ie;
_.prototype.visitList = lc;
_.prototype.visitStruct = uc;
_.prototype.visitUnion = Rn;
_.prototype.visitDenseUnion = Rn;
_.prototype.visitSparseUnion = Rn;
_.prototype.visitDictionary = dc;
_.prototype.visitInterval = Ln;
_.prototype.visitIntervalDayTime = Ln;
_.prototype.visitIntervalYearMonth = Ln;
_.prototype.visitDuration = qe;
_.prototype.visitDurationSecond = qe;
_.prototype.visitDurationMillisecond = qe;
_.prototype.visitDurationMicrosecond = qe;
_.prototype.visitDurationNanosecond = qe;
_.prototype.visitFixedSizeList = hc;
_.prototype.visitMap = fc;
const qt = new _();
function fn(i, t) {
  return qt.compareSchemas(i, t);
}
function Qi(i, t) {
  return yc(i, t.map((e) => e.data.concat()));
}
function yc(i, t) {
  const e = [...i.fields], n = [], s = { numBatches: t.reduce((h, V) => Math.max(h, V.length), 0) };
  let r = 0, o = 0, a = -1;
  const c = t.length;
  let u, d = [];
  for (; s.numBatches-- > 0; ) {
    for (o = Number.POSITIVE_INFINITY, a = -1; ++a < c; )
      d[a] = u = t[a].shift(), o = Math.min(o, u ? u.length : o);
    Number.isFinite(o) && (d = pc(e, o, d, t, s), o > 0 && (n[r++] = T({
      type: new Z(e),
      length: o,
      nullCount: 0,
      children: d.slice()
    })));
  }
  return [
    i = i.assign(e),
    n.map((h) => new nt(i, h))
  ];
}
function pc(i, t, e, n, s) {
  var r;
  const o = (t + 63 & -64) >> 3;
  for (let a = -1, c = n.length; ++a < c; ) {
    const u = e[a], d = u?.length;
    if (d >= t)
      d === t ? e[a] = u : (e[a] = u.slice(0, t), s.numBatches = Math.max(s.numBatches, n[a].unshift(u.slice(t, d - t))));
    else {
      const h = i[a];
      i[a] = h.clone({ nullable: !0 }), e[a] = (r = u?._changeLengthAndBackfillNullBitmap(t)) !== null && r !== void 0 ? r : T({
        type: h.type,
        length: t,
        nullCount: t,
        nullBitmap: new Uint8Array(o)
      });
    }
  }
  return e;
}
var oo;
class Q {
  constructor(...t) {
    var e, n;
    if (t.length === 0)
      return this.batches = [], this.schema = new L([]), this._offsets = [0], this;
    let s, r;
    t[0] instanceof L && (s = t.shift()), t.at(-1) instanceof Uint32Array && (r = t.pop());
    const o = (c) => {
      if (c) {
        if (c instanceof nt)
          return [c];
        if (c instanceof Q)
          return c.batches;
        if (c instanceof M) {
          if (c.type instanceof Z)
            return [new nt(new L(c.type.children), c)];
        } else {
          if (Array.isArray(c))
            return c.flatMap((u) => o(u));
          if (typeof c[Symbol.iterator] == "function")
            return [...c].flatMap((u) => o(u));
          if (typeof c == "object") {
            const u = Object.keys(c), d = u.map((F) => new R([c[F]])), h = s ?? new L(u.map((F, G) => new j(String(F), d[G].type, d[G].nullable))), [, V] = Qi(h, d);
            return V.length === 0 ? [new nt(c)] : V;
          }
        }
      }
      return [];
    }, a = t.flatMap((c) => o(c));
    if (s = (n = s ?? ((e = a[0]) === null || e === void 0 ? void 0 : e.schema)) !== null && n !== void 0 ? n : new L([]), !(s instanceof L))
      throw new TypeError("Table constructor expects a [Schema, RecordBatch[]] pair.");
    for (const c of a) {
      if (!(c instanceof nt))
        throw new TypeError("Table constructor expects a [Schema, RecordBatch[]] pair.");
      if (!fn(s, c.schema))
        throw new TypeError("Table and inner RecordBatch schemas must be equivalent.");
    }
    this.schema = s, this.batches = a, this._offsets = r ?? Jr(this.data);
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
    return this._nullCount === -1 && (this._nullCount = Kr(this.data)), this._nullCount;
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
    return this.get(Bn(t, this.numRows));
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
    return this.batches.length > 0 ? Fn.visit(new R(this.data)) : new Array(0)[Symbol.iterator]();
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
    return new Q(e, n.map((s) => new nt(e, s)));
  }
  /**
   * Return a zero-copy sub-section of this Table.
   *
   * @param begin The beginning of the specified portion of the Table.
   * @param end The end of the specified portion of the Table. This is exclusive of the element at the index 'end'.
   */
  slice(t, e) {
    const n = this.schema;
    [t, e] = Hr({ length: this.numRows }, t, e);
    const s = Qr(this.data, this._offsets, t, e);
    return new Q(n, s.map((r) => new nt(n, r)));
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
        const { type: n } = this.schema.fields[t], s = T({ type: n, length: 0, nullCount: 0 });
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
      e || (e = new R([T({ type: new Gt(), length: this.numRows })]));
      const r = n.fields.slice(), o = r[t].clone({ type: e.type }), a = this.schema.fields.map((c, u) => this.getChildAt(u));
      [r[t], a[t]] = [o, e], [n, s] = Qi(n, a);
    }
    return new Q(n, s);
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
    return new Q(e, n);
  }
  assign(t) {
    const e = this.schema.fields, [n, s] = t.schema.fields.reduce((a, c, u) => {
      const [d, h] = a, V = e.findIndex((F) => F.name === c.name);
      return ~V ? h[V] = u : d.push(u), a;
    }, [[], []]), r = this.schema.assign(t.schema), o = [
      ...e.map((a, c) => [c, s[c]]).map(([a, c]) => c === void 0 ? this.getChildAt(a) : t.getChildAt(c)),
      ...n.map((a) => t.getChildAt(a))
    ].filter(Boolean);
    return new Q(...Qi(r, o));
  }
}
oo = Symbol.toStringTag;
Q[oo] = ((i) => (i.schema = null, i.batches = [], i._offsets = new Uint32Array([0]), i._nullCount = -1, i[Symbol.isConcatSpreadable] = !0, i.isValid = Li(Tn), i.get = Li(rt.getVisitFn(l.Struct)), i.set = Zr(pt.getVisitFn(l.Struct)), i.indexOf = Xr(Ui.getVisitFn(l.Struct)), "Table"))(Q.prototype);
var ao;
let nt = class Ce {
  constructor(...t) {
    switch (t.length) {
      case 2: {
        if ([this.schema] = t, !(this.schema instanceof L))
          throw new TypeError("RecordBatch constructor expects a [Schema, Data] pair.");
        if ([
          ,
          this.data = T({
            nullCount: 0,
            type: new Z(this.schema.fields),
            children: this.schema.fields.map((e) => T({ type: e.type, nullCount: 0 }))
          })
        ] = t, !(this.data instanceof M))
          throw new TypeError("RecordBatch constructor expects a [Schema, Data] pair.");
        [this.schema, this.data] = us(this.schema, this.data.children);
        break;
      }
      case 1: {
        const [e] = t, { fields: n, children: s, length: r } = Object.keys(e).reduce((c, u, d) => (c.children[d] = e[u], c.length = Math.max(c.length, e[u].length), c.fields[d] = j.new({ name: u, type: e[u].type, nullable: !0 }), c), {
          length: 0,
          fields: new Array(),
          children: new Array()
        }), o = new L(n), a = T({ type: new Z(n), length: r, children: s, nullCount: 0 });
        [this.schema, this.data] = us(o, a.children, r);
        break;
      }
      default:
        throw new TypeError("RecordBatch constructor expects an Object mapping names to child Data, or a [Schema, Data] pair.");
    }
  }
  get dictionaries() {
    return this._dictionaries || (this._dictionaries = co(this.schema.fields, this.data.children));
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
    return rt.visit(this.data, t);
  }
  /**
    * Get a row value by position.
    * @param index The index of the row to read. A negative index will count back from the last row.
    */
  at(t) {
    return this.get(Bn(t, this.numRows));
  }
  /**
   * Set a row by position.
   * @param index The index of the row to write.
   * @param value The value to set.
   */
  set(t, e) {
    return pt.visit(this.data, t, e);
  }
  /**
   * Retrieve the index of the first occurrence of a row in an RecordBatch.
   * @param element The row to locate in the RecordBatch.
   * @param offset The index at which to begin the search. If offset is omitted, the search starts at index 0.
   */
  indexOf(t, e) {
    return Ui.visit(this.data, t, e);
  }
  /**
   * Iterator for rows in this RecordBatch.
   */
  [Symbol.iterator]() {
    return Fn.visit(new R([this.data]));
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
    return new Q(this.schema, [this, ...t]);
  }
  /**
   * Return a zero-copy sub-section of this RecordBatch.
   * @param start The beginning of the specified portion of the RecordBatch.
   * @param end The end of the specified portion of the RecordBatch. This is exclusive of the row at the index 'end'.
   */
  slice(t, e) {
    const [n] = new R([this.data]).slice(t, e).data;
    return new Ce(this.schema, n);
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
      e || (e = new R([T({ type: new Gt(), length: this.numRows })]));
      const r = n.fields.slice(), o = s.children.slice(), a = r[t].clone({ type: e.type });
      [r[t], o[t]] = [a, e.data[0]], n = new L(r, new Map(this.schema.metadata)), s = T({ type: new Z(r), children: o });
    }
    return new Ce(n, s);
  }
  /**
   * Construct a new RecordBatch containing only specified columns.
   *
   * @param columnNames Names of columns to keep.
   * @returns A new RecordBatch of columns matching the specified names.
   */
  select(t) {
    const e = this.schema.select(t), n = new Z(e.fields), s = [];
    for (const r of t) {
      const o = this.schema.fields.findIndex((a) => a.name === r);
      ~o && (s[o] = this.data.children[o]);
    }
    return new Ce(e, T({ type: n, length: this.numRows, children: s }));
  }
  /**
   * Construct a new RecordBatch containing only columns at the specified indices.
   *
   * @param columnIndices Indices of columns to keep.
   * @returns A new RecordBatch of columns matching at the specified indices.
   */
  selectAt(t) {
    const e = this.schema.selectAt(t), n = t.map((r) => this.data.children[r]).filter(Boolean), s = T({ type: new Z(e.fields), length: this.numRows, children: n });
    return new Ce(e, s);
  }
};
ao = Symbol.toStringTag;
nt[ao] = ((i) => (i._nullCount = -1, i[Symbol.isConcatSpreadable] = !0, "RecordBatch"))(nt.prototype);
function us(i, t, e = t.reduce((n, s) => Math.max(n, s.length), 0)) {
  var n;
  const s = [...i.fields], r = [...t], o = (e + 63 & -64) >> 3;
  for (const [a, c] of i.fields.entries()) {
    const u = t[a];
    (!u || u.length !== e) && (s[a] = c.clone({ nullable: !0 }), r[a] = (n = u?._changeLengthAndBackfillNullBitmap(e)) !== null && n !== void 0 ? n : T({
      type: c.type,
      length: e,
      nullCount: e,
      nullBitmap: new Uint8Array(o)
    }));
  }
  return [
    i.assign(s),
    T({ type: new Z(s), length: e, children: r })
  ];
}
function co(i, t, e = /* @__PURE__ */ new Map()) {
  var n, s;
  if (((n = i?.length) !== null && n !== void 0 ? n : 0) > 0 && i?.length === t?.length)
    for (let r = -1, o = i.length; ++r < o; ) {
      const { type: a } = i[r], c = t[r];
      for (const u of [c, ...((s = c?.dictionary) === null || s === void 0 ? void 0 : s.data) || []])
        co(a.children, u?.children, e);
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
class Un extends nt {
  constructor(t) {
    const e = t.fields.map((s) => T({ type: s.type })), n = T({ type: new Z(t.fields), nullCount: 0, children: e });
    super(t, n);
  }
}
let jt = class It {
  constructor() {
    this.bb = null, this.bb_pos = 0;
  }
  __init(t, e) {
    return this.bb_pos = t, this.bb = e, this;
  }
  static getRootAsMessage(t, e) {
    return (e || new It()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  static getSizePrefixedRootAsMessage(t, e) {
    return t.setPosition(t.position() + U), (e || new It()).__init(t.readInt32(t.position()) + t.position(), t);
  }
  version() {
    const t = this.bb.__offset(this.bb_pos, 4);
    return t ? this.bb.readInt16(this.bb_pos + t) : W.V1;
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
    t.addFieldInt16(0, e, W.V1);
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
    return It.startMessage(t), It.addVersion(t, e), It.addHeaderType(t, n), It.addHeader(t, s), It.addBodyLength(t, r), It.addCustomMetadata(t, o), It.endMessage(t);
  }
};
class mc extends A {
  visit(t, e) {
    return t == null || e == null ? void 0 : super.visit(t, e);
  }
  visitNull(t, e) {
    return es.startNull(e), es.endNull(e);
  }
  visitInt(t, e) {
    return at.startInt(e), at.addBitWidth(e, t.bitWidth), at.addIsSigned(e, t.isSigned), at.endInt(e);
  }
  visitFloat(t, e) {
    return Dt.startFloatingPoint(e), Dt.addPrecision(e, t.precision), Dt.endFloatingPoint(e);
  }
  visitBinary(t, e) {
    return Jn.startBinary(e), Jn.endBinary(e);
  }
  visitLargeBinary(t, e) {
    return Zn.startLargeBinary(e), Zn.endLargeBinary(e);
  }
  visitBool(t, e) {
    return Qn.startBool(e), Qn.endBool(e);
  }
  visitUtf8(t, e) {
    return is.startUtf8(e), is.endUtf8(e);
  }
  visitLargeUtf8(t, e) {
    return Xn.startLargeUtf8(e), Xn.endLargeUtf8(e);
  }
  visitDecimal(t, e) {
    return ae.startDecimal(e), ae.addScale(e, t.scale), ae.addPrecision(e, t.precision), ae.addBitWidth(e, t.bitWidth), ae.endDecimal(e);
  }
  visitDate(t, e) {
    return ei.startDate(e), ei.addUnit(e, t.unit), ei.endDate(e);
  }
  visitTime(t, e) {
    return dt.startTime(e), dt.addUnit(e, t.unit), dt.addBitWidth(e, t.bitWidth), dt.endTime(e);
  }
  visitTimestamp(t, e) {
    const n = t.timezone && e.createString(t.timezone) || void 0;
    return ht.startTimestamp(e), ht.addUnit(e, t.unit), n !== void 0 && ht.addTimezone(e, n), ht.endTimestamp(e);
  }
  visitInterval(t, e) {
    return At.startInterval(e), At.addUnit(e, t.unit), At.endInterval(e);
  }
  visitDuration(t, e) {
    return ii.startDuration(e), ii.addUnit(e, t.unit), ii.endDuration(e);
  }
  visitList(t, e) {
    return ts.startList(e), ts.endList(e);
  }
  visitStruct(t, e) {
    return Zt.startStruct_(e), Zt.endStruct_(e);
  }
  visitUnion(t, e) {
    it.startTypeIdsVector(e, t.typeIds.length);
    const n = it.createTypeIdsVector(e, t.typeIds);
    return it.startUnion(e), it.addMode(e, t.mode), it.addTypeIds(e, n), it.endUnion(e);
  }
  visitDictionary(t, e) {
    const n = this.visit(t.indices, e);
    return Pt.startDictionaryEncoding(e), Pt.addId(e, BigInt(t.id)), Pt.addIsOrdered(e, t.isOrdered), n !== void 0 && Pt.addIndexType(e, n), Pt.endDictionaryEncoding(e);
  }
  visitFixedSizeBinary(t, e) {
    return ni.startFixedSizeBinary(e), ni.addByteWidth(e, t.byteWidth), ni.endFixedSizeBinary(e);
  }
  visitFixedSizeList(t, e) {
    return si.startFixedSizeList(e), si.addListSize(e, t.listSize), si.endFixedSizeList(e);
  }
  visitMap(t, e) {
    return ri.startMap(e), ri.addKeysSorted(e, t.keysSorted), ri.endMap(e);
  }
}
const Zi = new mc();
function _c(i, t = /* @__PURE__ */ new Map()) {
  return new L(bc(i, t), ci(i.metadata), t);
}
function lo(i) {
  return new ct(i.count, uo(i.columns), ho(i.columns));
}
function gc(i) {
  return new Nt(lo(i.data), i.id, i.isDelta);
}
function bc(i, t) {
  return (i.fields || []).filter(Boolean).map((e) => j.fromJSON(e, t));
}
function ds(i, t) {
  return (i.children || []).filter(Boolean).map((e) => j.fromJSON(e, t));
}
function uo(i) {
  return (i || []).reduce((t, e) => [
    ...t,
    new Kt(e.count, wc(e.VALIDITY)),
    ...uo(e.children)
  ], []);
}
function ho(i, t = []) {
  for (let e = -1, n = (i || []).length; ++e < n; ) {
    const s = i[e];
    s.VALIDITY && t.push(new Ft(t.length, s.VALIDITY.length)), s.TYPE_ID && t.push(new Ft(t.length, s.TYPE_ID.length)), s.OFFSET && t.push(new Ft(t.length, s.OFFSET.length)), s.DATA && t.push(new Ft(t.length, s.DATA.length)), t = ho(s.children, t);
  }
  return t;
}
function wc(i) {
  return (i || []).reduce((t, e) => t + +(e === 0), 0);
}
function Ic(i, t) {
  let e, n, s, r, o, a;
  return !t || !(r = i.dictionary) ? (o = fs(i, ds(i, t)), s = new j(i.name, o, i.nullable, ci(i.metadata))) : t.has(e = r.id) ? (n = (n = r.indexType) ? hs(n) : new Ve(), a = new ve(t.get(e), n, e, r.isOrdered), s = new j(i.name, a, i.nullable, ci(i.metadata))) : (n = (n = r.indexType) ? hs(n) : new Ve(), t.set(e, o = fs(i, ds(i, t))), a = new ve(o, n, e, r.isOrdered), s = new j(i.name, a, i.nullable, ci(i.metadata))), s || null;
}
function ci(i = []) {
  return new Map(i.map(({ key: t, value: e }) => [t, e]));
}
function hs(i) {
  return new ee(i.isSigned, i.bitWidth);
}
function fs(i, t) {
  const e = i.type.name;
  switch (e) {
    case "NONE":
      return new Gt();
    case "null":
      return new Gt();
    case "binary":
      return new pi();
    case "largebinary":
      return new mi();
    case "utf8":
      return new _i();
    case "largeutf8":
      return new gi();
    case "bool":
      return new bi();
    case "list":
      return new Ai((t || [])[0]);
    case "struct":
      return new Z(t || []);
    case "struct_":
      return new Z(t || []);
  }
  switch (e) {
    case "int": {
      const n = i.type;
      return new ee(n.isSigned, n.bitWidth);
    }
    case "floatingpoint": {
      const n = i.type;
      return new yi(K[n.precision]);
    }
    case "decimal": {
      const n = i.type;
      return new wi(n.scale, n.precision, n.bitWidth);
    }
    case "date": {
      const n = i.type;
      return new Ii(yt[n.unit]);
    }
    case "time": {
      const n = i.type;
      return new vi(g[n.unit], n.bitWidth);
    }
    case "timestamp": {
      const n = i.type;
      return new Si(g[n.unit], n.timezone);
    }
    case "interval": {
      const n = i.type;
      return new Bi(Et[n.unit]);
    }
    case "duration": {
      const n = i.type;
      return new Di(g[n.unit]);
    }
    case "union": {
      const n = i.type, [s, ...r] = (n.mode + "").toLowerCase(), o = s.toUpperCase() + r.join("");
      return new Ti(J[o], n.typeIds || [], t || []);
    }
    case "fixedsizebinary": {
      const n = i.type;
      return new Fi(n.byteWidth);
    }
    case "fixedsizelist": {
      const n = i.type;
      return new Oi(n.listSize, (t || [])[0]);
    }
    case "map": {
      const n = i.type;
      return new Ei((t || [])[0], n.keysSorted);
    }
  }
  throw new Error(`Unrecognized type: "${e}"`);
}
var vc = Ts, Sc = we;
class X {
  /** @nocollapse */
  static fromJSON(t, e) {
    const n = new X(0, W.V5, e);
    return n._createHeader = Bc(t, e), n;
  }
  /** @nocollapse */
  static decode(t) {
    t = new Sc(O(t));
    const e = jt.getRootAsMessage(t), n = e.bodyLength(), s = e.version(), r = e.headerType(), o = new X(n, s, r);
    return o._createHeader = Dc(e, r), o;
  }
  /** @nocollapse */
  static encode(t) {
    const e = new vc();
    let n = -1;
    return t.isSchema() ? n = L.encode(e, t.header()) : t.isRecordBatch() ? n = ct.encode(e, t.header()) : t.isDictionaryBatch() && (n = Nt.encode(e, t.header())), jt.startMessage(e), jt.addVersion(e, W.V5), jt.addHeader(e, n), jt.addHeaderType(e, t.headerType), jt.addBodyLength(e, BigInt(t.bodyLength)), jt.finishMessageBuffer(e, jt.endMessage(e)), e.asUint8Array();
  }
  /** @nocollapse */
  static from(t, e = 0) {
    if (t instanceof L)
      return new X(0, W.V5, N.Schema, t);
    if (t instanceof ct)
      return new X(e, W.V5, N.RecordBatch, t);
    if (t instanceof Nt)
      return new X(e, W.V5, N.DictionaryBatch, t);
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
class ct {
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
    this._data = t, this._isDelta = n, this._id = x(e);
  }
}
class Ft {
  constructor(t, e) {
    this.offset = x(t), this.length = x(e);
  }
}
class Kt {
  constructor(t, e) {
    this.length = x(t), this.nullCount = x(e);
  }
}
function Bc(i, t) {
  return (() => {
    switch (t) {
      case N.Schema:
        return L.fromJSON(i);
      case N.RecordBatch:
        return ct.fromJSON(i);
      case N.DictionaryBatch:
        return Nt.fromJSON(i);
    }
    throw new Error(`Unrecognized Message type: { name: ${N[t]}, type: ${t} }`);
  });
}
function Dc(i, t) {
  return (() => {
    switch (t) {
      case N.Schema:
        return L.decode(i.header(new vt()), /* @__PURE__ */ new Map(), i.version());
      case N.RecordBatch:
        return ct.decode(i.header(new Lt()), i.version());
      case N.DictionaryBatch:
        return Nt.decode(i.header(new re()), i.version());
    }
    throw new Error(`Unrecognized Message type: { name: ${N[t]}, type: ${t} }`);
  });
}
j.encode = Cc;
j.decode = Uc;
j.fromJSON = Ic;
L.encode = Mc;
L.decode = Ac;
L.fromJSON = _c;
ct.encode = Pc;
ct.decode = Tc;
ct.fromJSON = lo;
Nt.encode = kc;
Nt.decode = Fc;
Nt.fromJSON = gc;
Kt.encode = xc;
Kt.decode = Ec;
Ft.encode = zc;
Ft.decode = Oc;
function Ac(i, t = /* @__PURE__ */ new Map(), e = W.V5) {
  const n = Lc(i, t);
  return new L(n, li(i), t, e);
}
function Tc(i, t = W.V5) {
  if (i.compression() !== null)
    throw new Error("Record batch compression not implemented");
  return new ct(i.length(), Nc(i), Rc(i, t));
}
function Fc(i, t = W.V5) {
  return new Nt(ct.decode(i.data(), t), i.id(), i.isDelta());
}
function Oc(i) {
  return new Ft(i.offset(), i.length());
}
function Ec(i) {
  return new Kt(i.length(), i.nullCount());
}
function Nc(i) {
  const t = [];
  for (let e, n = -1, s = -1, r = i.nodesLength(); ++n < r; )
    (e = i.nodes(n)) && (t[++s] = Kt.decode(e));
  return t;
}
function Rc(i, t) {
  const e = [];
  for (let n, s = -1, r = -1, o = i.buffersLength(); ++s < o; )
    (n = i.buffers(s)) && (t < W.V4 && (n.bb_pos += 8 * (s + 1)), e[++r] = Ft.decode(n));
  return e;
}
function Lc(i, t) {
  const e = [];
  for (let n, s = -1, r = -1, o = i.fieldsLength(); ++s < o; )
    (n = i.fields(s)) && (e[++r] = j.decode(n, t));
  return e;
}
function ys(i, t) {
  const e = [];
  for (let n, s = -1, r = -1, o = i.childrenLength(); ++s < o; )
    (n = i.children(s)) && (e[++r] = j.decode(n, t));
  return e;
}
function Uc(i, t) {
  let e, n, s, r, o, a;
  return !t || !(a = i.dictionary()) ? (s = ms(i, ys(i, t)), n = new j(i.name(), s, i.nullable(), li(i))) : t.has(e = x(a.id())) ? (r = (r = a.indexType()) ? ps(r) : new Ve(), o = new ve(t.get(e), r, e, a.isOrdered()), n = new j(i.name(), o, i.nullable(), li(i))) : (r = (r = a.indexType()) ? ps(r) : new Ve(), t.set(e, s = ms(i, ys(i, t))), o = new ve(s, r, e, a.isOrdered()), n = new j(i.name(), o, i.nullable(), li(i))), n || null;
}
function li(i) {
  const t = /* @__PURE__ */ new Map();
  if (i)
    for (let e, n, s = -1, r = Math.trunc(i.customMetadataLength()); ++s < r; )
      (e = i.customMetadata(s)) && (n = e.key()) != null && t.set(n, e.value());
  return t;
}
function ps(i) {
  return new ee(i.isSigned(), i.bitWidth());
}
function ms(i, t) {
  const e = i.typeType();
  switch (e) {
    case z.NONE:
      return new Gt();
    case z.Null:
      return new Gt();
    case z.Binary:
      return new pi();
    case z.LargeBinary:
      return new mi();
    case z.Utf8:
      return new _i();
    case z.LargeUtf8:
      return new gi();
    case z.Bool:
      return new bi();
    case z.List:
      return new Ai((t || [])[0]);
    case z.Struct_:
      return new Z(t || []);
  }
  switch (e) {
    case z.Int: {
      const n = i.type(new at());
      return new ee(n.isSigned(), n.bitWidth());
    }
    case z.FloatingPoint: {
      const n = i.type(new Dt());
      return new yi(n.precision());
    }
    case z.Decimal: {
      const n = i.type(new ae());
      return new wi(n.scale(), n.precision(), n.bitWidth());
    }
    case z.Date: {
      const n = i.type(new ei());
      return new Ii(n.unit());
    }
    case z.Time: {
      const n = i.type(new dt());
      return new vi(n.unit(), n.bitWidth());
    }
    case z.Timestamp: {
      const n = i.type(new ht());
      return new Si(n.unit(), n.timezone());
    }
    case z.Interval: {
      const n = i.type(new At());
      return new Bi(n.unit());
    }
    case z.Duration: {
      const n = i.type(new ii());
      return new Di(n.unit());
    }
    case z.Union: {
      const n = i.type(new it());
      return new Ti(n.mode(), n.typeIdsArray() || [], t || []);
    }
    case z.FixedSizeBinary: {
      const n = i.type(new ni());
      return new Fi(n.byteWidth());
    }
    case z.FixedSizeList: {
      const n = i.type(new si());
      return new Oi(n.listSize(), (t || [])[0]);
    }
    case z.Map: {
      const n = i.type(new ri());
      return new Ei((t || [])[0], n.keysSorted());
    }
  }
  throw new Error(`Unrecognized type: "${z[e]}" (${e})`);
}
function Mc(i, t) {
  const e = t.fields.map((r) => j.encode(i, r));
  vt.startFieldsVector(i, e.length);
  const n = vt.createFieldsVector(i, e), s = t.metadata && t.metadata.size > 0 ? vt.createCustomMetadataVector(i, [...t.metadata].map(([r, o]) => {
    const a = i.createString(`${r}`), c = i.createString(`${o}`);
    return q.startKeyValue(i), q.addKey(i, a), q.addValue(i, c), q.endKeyValue(i);
  })) : -1;
  return vt.startSchema(i), vt.addFields(i, n), vt.addEndianness(i, Vc ? Ie.Little : Ie.Big), s !== -1 && vt.addCustomMetadata(i, s), vt.endSchema(i);
}
function Cc(i, t) {
  let e = -1, n = -1, s = -1;
  const r = t.type;
  let o = t.typeId;
  f.isDictionary(r) ? (o = r.dictionary.typeId, s = Zi.visit(r, i), n = Zi.visit(r.dictionary, i)) : n = Zi.visit(r, i);
  const a = (r.children || []).map((d) => j.encode(i, d)), c = lt.createChildrenVector(i, a), u = t.metadata && t.metadata.size > 0 ? lt.createCustomMetadataVector(i, [...t.metadata].map(([d, h]) => {
    const V = i.createString(`${d}`), F = i.createString(`${h}`);
    return q.startKeyValue(i), q.addKey(i, V), q.addValue(i, F), q.endKeyValue(i);
  })) : -1;
  return t.name && (e = i.createString(t.name)), lt.startField(i), lt.addType(i, n), lt.addTypeType(i, o), lt.addChildren(i, c), lt.addNullable(i, !!t.nullable), e !== -1 && lt.addName(i, e), s !== -1 && lt.addDictionary(i, s), u !== -1 && lt.addCustomMetadata(i, u), lt.endField(i);
}
function Pc(i, t) {
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
function kc(i, t) {
  const e = ct.encode(i, t.data);
  return re.startDictionaryBatch(i), re.addId(i, BigInt(t.id)), re.addIsDelta(i, t.isDelta), re.addData(i, e), re.endDictionaryBatch(i);
}
function xc(i, t) {
  return Es.createFieldNode(i, BigInt(t.length), BigInt(t.nullCount));
}
function zc(i, t) {
  return Os.createBuffer(i, BigInt(t.offset), BigInt(t.length));
}
const Vc = (() => {
  const i = new ArrayBuffer(2);
  return new DataView(i).setInt16(
    0,
    256,
    !0
    /* littleEndian */
  ), new Int16Array(i)[0] === 256;
})(), Mn = (i) => `Expected ${N[i]} Message in stream, but was null or length 0.`, Cn = (i) => `Header pointer of flatbuffer-encoded ${N[i]} Message is null or length 0.`, fo = (i, t) => `Expected to read ${i} metadata bytes, but only read ${t}.`, yo = (i, t) => `Expected to read ${i} bytes for message body, but only read ${t}.`;
class po {
  constructor(t) {
    this.source = t instanceof Ci ? t : new Ci(t);
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
      throw new Error(Mn(t));
    return e.value;
  }
  readMessageBody(t) {
    if (t <= 0)
      return new Uint8Array(0);
    const e = O(this.source.read(t));
    if (e.byteLength < t)
      throw new Error(yo(t, e.byteLength));
    return (
      /* 1. */
      e.byteOffset % 8 === 0 && /* 2. */
      e.byteOffset + e.byteLength <= e.buffer.byteLength ? e : e.slice()
    );
  }
  readSchema(t = !1) {
    const e = N.Schema, n = this.readMessage(e), s = n?.header();
    if (t && !s)
      throw new Error(Cn(e));
    return s;
  }
  readMetadataLength() {
    const t = this.source.read(Wi), e = t && new we(t), n = e?.readInt32(0) || 0;
    return { done: n === 0, value: n };
  }
  readMetadata(t) {
    const e = this.source.read(t);
    if (!e)
      return $;
    if (e.byteLength < t)
      throw new Error(fo(t, e.byteLength));
    return { done: !1, value: X.decode(e) };
  }
}
class jc {
  constructor(t, e) {
    this.source = t instanceof Se ? t : Is(t) ? new Pi(t, e) : new Se(t);
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
        throw new Error(Mn(t));
      return e.value;
    });
  }
  readMessageBody(t) {
    return B(this, void 0, void 0, function* () {
      if (t <= 0)
        return new Uint8Array(0);
      const e = O(yield this.source.read(t));
      if (e.byteLength < t)
        throw new Error(yo(t, e.byteLength));
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
        throw new Error(Cn(e));
      return s;
    });
  }
  readMetadataLength() {
    return B(this, void 0, void 0, function* () {
      const t = yield this.source.read(Wi), e = t && new we(t), n = e?.readInt32(0) || 0;
      return { done: n === 0, value: n };
    });
  }
  readMetadata(t) {
    return B(this, void 0, void 0, function* () {
      const e = yield this.source.read(t);
      if (!e)
        return $;
      if (e.byteLength < t)
        throw new Error(fo(t, e.byteLength));
      return { done: !1, value: X.decode(e) };
    });
  }
}
class $c extends po {
  constructor(t) {
    super(new Uint8Array(0)), this._schema = !1, this._body = [], this._batchIndex = 0, this._dictionaryIndex = 0, this._json = t instanceof cs ? t : new cs(t);
  }
  next() {
    const { _json: t } = this;
    if (!this._schema)
      return this._schema = !0, { done: !1, value: X.fromJSON(t.schema, N.Schema) };
    if (this._dictionaryIndex < t.dictionaries.length) {
      const e = t.dictionaries[this._dictionaryIndex++];
      return this._body = e.data.columns, { done: !1, value: X.fromJSON(e, N.DictionaryBatch) };
    }
    if (this._batchIndex < t.batches.length) {
      const e = t.batches[this._batchIndex++];
      return this._body = e.columns, { done: !1, value: X.fromJSON(e, N.RecordBatch) };
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
      throw new Error(Mn(t));
    return e.value;
  }
  readSchema() {
    const t = N.Schema, e = this.readMessage(t), n = e?.header();
    if (!e || !n)
      throw new Error(Cn(t));
    return n;
  }
}
const Wi = 4, yn = "ARROW1", $e = new Uint8Array(yn.length);
for (let i = 0; i < yn.length; i += 1)
  $e[i] = yn.codePointAt(i);
function Pn(i, t = 0) {
  for (let e = -1, n = $e.length; ++e < n; )
    if ($e[e] !== i[t + e])
      return !1;
  return !0;
}
const Ke = $e.length, mo = Ke + Wi, Yc = Ke * 2 + Wi;
class ft extends On {
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
    return ut.toDOMStream(this.isSync() ? { [Symbol.iterator]: () => this } : { [Symbol.asyncIterator]: () => this });
  }
  toNodeStream() {
    return ut.toNodeStream(this.isSync() ? { [Symbol.iterator]: () => this } : { [Symbol.asyncIterator]: () => this }, { objectMode: !0 });
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
    return t instanceof ft ? t : sn(t) ? qc(t) : Is(t) ? Qc(t) : te(t) ? B(this, void 0, void 0, function* () {
      return yield ft.from(yield t);
    }) : vs(t) || gn(t) || Ss(t) || De(t) ? Jc(new Se(t)) : Kc(new Ci(t));
  }
  /** @nocollapse */
  static readAll(t) {
    return t instanceof ft ? t.isSync() ? _s(t) : gs(t) : sn(t) || ArrayBuffer.isView(t) || We(t) || ws(t) ? _s(t) : gs(t);
  }
}
class ki extends ft {
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
    return Tt(this, arguments, function* () {
      yield D(yield* ti(Xt(this[Symbol.iterator]())));
    });
  }
}
class xi extends ft {
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
class _o extends ki {
  constructor(t) {
    super(t), this._impl = t;
  }
}
class Wc extends xi {
  constructor(t) {
    super(t), this._impl = t;
  }
}
class go {
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
    const n = this._loadVectors(t, e, this.schema.fields), s = T({ type: new Z(this.schema.fields), length: t.length, children: n });
    return new nt(this.schema, s);
  }
  _loadDictionaryBatch(t, e) {
    const { id: n, isDelta: s } = t, { dictionaries: r, schema: o } = this, a = r.get(n), c = o.dictionaries.get(n), u = this._loadVectors(t.data, e, [c]);
    return (a && s ? a.concat(new R(u)) : new R(u)).memoize();
  }
  _loadVectors(t, e, n) {
    return new ro(e, t.nodes, t.buffers, this.dictionaries, this.schema.metadataVersion).visitMany(n);
  }
}
class zi extends go {
  constructor(t, e) {
    super(e), this._reader = sn(t) ? new $c(this._handle = t) : new po(this._handle = t);
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
    return this.closed || (this.autoDestroy = wo(this, t), this.schema || (this.schema = this._reader.readSchema()) || this.cancel()), this;
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
    return this.schema && this._recordBatchIndex === 0 ? (this._recordBatchIndex++, { done: !1, value: new Un(this.schema) }) : this.return();
  }
  _readNextMessageAndValidate(t) {
    return this._reader.readMessage(t);
  }
}
class Vi extends go {
  constructor(t, e) {
    super(e), this._reader = new jc(this._handle = t);
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
      return this.closed || (this.autoDestroy = wo(this, t), this.schema || (this.schema = yield this._reader.readSchema()) || (yield this.cancel())), this;
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
      return this.schema && this._recordBatchIndex === 0 ? (this._recordBatchIndex++, { done: !1, value: new Un(this.schema) }) : yield this.return();
    });
  }
  _readNextMessageAndValidate(t) {
    return B(this, void 0, void 0, function* () {
      return yield this._reader.readMessage(t);
    });
  }
}
class bo extends zi {
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
    super(t instanceof ls ? t : new ls(t), e);
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
    const { _handle: t } = this, e = t.size - mo, n = t.readInt32(e), s = t.readAt(e - n, n);
    return je.decode(s);
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
class Gc extends Vi {
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
    super(t instanceof Pi ? t : new Pi(t, n), s);
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
      const e = t.size - mo, n = yield t.readInt32(e), s = yield t.readAt(e - n, n);
      return je.decode(s);
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
class Hc extends zi {
  constructor(t, e) {
    super(t, e);
  }
  _loadVectors(t, e, n) {
    return new oc(e, t.nodes, t.buffers, this.dictionaries, this.schema.metadataVersion).visitMany(n);
  }
}
function wo(i, t) {
  return t && typeof t.autoDestroy == "boolean" ? t.autoDestroy : i.autoDestroy;
}
function* _s(i) {
  const t = ft.from(i);
  try {
    if (!t.open({ autoDestroy: !1 }).closed)
      do
        yield t;
      while (!t.reset().open().closed);
  } finally {
    t.cancel();
  }
}
function gs(i) {
  return Tt(this, arguments, function* () {
    const e = yield D(ft.from(i));
    try {
      if (!(yield D(e.open({ autoDestroy: !1 }))).closed)
        do
          yield yield D(e);
        while (!(yield D(e.reset().open())).closed);
    } finally {
      yield D(e.cancel());
    }
  });
}
function qc(i) {
  return new ki(new Hc(i));
}
function Kc(i) {
  const t = i.peek(Ke + 7 & -8);
  return t && t.byteLength >= 4 ? Pn(t) ? new _o(new bo(i.read())) : new ki(new zi(i)) : new ki(new zi((function* () {
  })()));
}
function Jc(i) {
  return B(this, void 0, void 0, function* () {
    const t = yield i.peek(Ke + 7 & -8);
    return t && t.byteLength >= 4 ? Pn(t) ? new _o(new bo(yield i.read())) : new xi(new Vi(i)) : new xi(new Vi((function() {
      return Tt(this, arguments, function* () {
      });
    })()));
  });
}
function Qc(i) {
  return B(this, void 0, void 0, function* () {
    const { size: t } = yield i.stat(), e = new Pi(i, t);
    return t >= Yc && Pn(yield e.readAt(0, Ke + 7 & -8)) ? new Wc(new Gc(e)) : new xi(new Vi(e));
  });
}
class Y extends A {
  /** @nocollapse */
  static assemble(...t) {
    const e = (s) => s.flatMap((r) => Array.isArray(r) ? e(r) : r instanceof nt ? r.data.children : r.data), n = new Y();
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
        f.isNull(e) || bt.call(this, s <= 0 ? new Uint8Array(0) : Ni(t.offset, n, t.nullBitmap)), this.nodes.push(new Kt(n, s));
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
function bt(i) {
  const t = i.byteLength + 7 & -8;
  return this.buffers.push(i), this.bufferRegions.push(new Ft(this._byteLength, t)), this._byteLength += t, this;
}
function Zc(i) {
  var t;
  const { type: e, length: n, typeIds: s, valueOffsets: r } = i;
  if (bt.call(this, s), e.mode === J.Sparse)
    return pn.call(this, i);
  if (e.mode === J.Dense) {
    if (i.offset <= 0)
      return bt.call(this, r), pn.call(this, i);
    {
      const o = new Int32Array(n), a = /* @__PURE__ */ Object.create(null), c = /* @__PURE__ */ Object.create(null);
      for (let u, d, h = -1; ++h < n; )
        (u = s[h]) !== void 0 && ((d = a[u]) === void 0 && (d = a[u] = r[h]), o[h] = r[h] - d, c[u] = ((t = c[u]) !== null && t !== void 0 ? t : 0) + 1);
      bt.call(this, o), this.visitMany(i.children.map((u, d) => {
        const h = e.typeIds[d], V = a[h], F = c[h];
        return u.slice(V, Math.min(n, F));
      }));
    }
  }
  return this;
}
function Xc(i) {
  let t;
  return i.nullCount >= i.length ? bt.call(this, new Uint8Array(0)) : (t = i.values) instanceof Uint8Array ? bt.call(this, Ni(i.offset, i.length, t)) : bt.call(this, Ri(i.values));
}
function zt(i) {
  return bt.call(this, i.values.subarray(0, i.length * i.stride));
}
function Gi(i) {
  const { length: t, values: e, valueOffsets: n } = i, s = x(n[0]), r = x(n[t]), o = Math.min(r - s, e.byteLength - s);
  return bt.call(this, Ds(-s, t + 1, n)), bt.call(this, e.subarray(s, s + o)), this;
}
function kn(i) {
  const { length: t, valueOffsets: e } = i;
  if (e) {
    const { [0]: n, [t]: s } = e;
    return bt.call(this, Ds(-n, t + 1, e)), this.visit(i.children[0].slice(n, s - n));
  }
  return this.visit(i.children[0]);
}
function pn(i) {
  return this.visitMany(i.type.children.map((t, e) => i.children[e]).filter(Boolean))[0];
}
Y.prototype.visitBool = Xc;
Y.prototype.visitInt = zt;
Y.prototype.visitFloat = zt;
Y.prototype.visitUtf8 = Gi;
Y.prototype.visitLargeUtf8 = Gi;
Y.prototype.visitBinary = Gi;
Y.prototype.visitLargeBinary = Gi;
Y.prototype.visitFixedSizeBinary = zt;
Y.prototype.visitDate = zt;
Y.prototype.visitTimestamp = zt;
Y.prototype.visitTime = zt;
Y.prototype.visitDecimal = zt;
Y.prototype.visitList = kn;
Y.prototype.visitStruct = pn;
Y.prototype.visitUnion = Zc;
Y.prototype.visitInterval = zt;
Y.prototype.visitDuration = zt;
Y.prototype.visitFixedSizeList = kn;
Y.prototype.visitMap = kn;
class Io extends On {
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
    super(), this._position = 0, this._started = !1, this._sink = new ai(), this._schema = null, this._dictionaryBlocks = [], this._recordBatchBlocks = [], this._seenDictionaries = /* @__PURE__ */ new Map(), this._dictionaryDeltaOffsets = /* @__PURE__ */ new Map(), st(t) || (t = { autoDestroy: !0, writeLegacyIpcFormat: !1 }), this._autoDestroy = typeof t.autoDestroy == "boolean" ? t.autoDestroy : !0, this._writeLegacyIpcFormat = typeof t.writeLegacyIpcFormat == "boolean" ? t.writeLegacyIpcFormat : !1;
  }
  toString(t = !1) {
    return this._sink.toString(t);
  }
  toUint8Array(t = !1) {
    return this._sink.toUint8Array(t);
  }
  writeAll(t) {
    return te(t) ? t.then((e) => this.writeAll(e)) : De(t) ? jn(this, t) : Vn(this, t);
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
    return t === this._sink || t instanceof ai ? this._sink = t : (this._sink = new ai(), t && Eo(t) ? this.toDOMStream({ type: "bytes" }).pipeTo(t) : t && No(t) && this.toNodeStream({ objectMode: !1 }).pipe(t)), this._started && this._schema && this._writeFooter(this._schema), this._started = !1, this._dictionaryBlocks = [], this._recordBatchBlocks = [], this._seenDictionaries = /* @__PURE__ */ new Map(), this._dictionaryDeltaOffsets = /* @__PURE__ */ new Map(), (!e || !fn(e, this._schema)) && (e == null ? (this._position = 0, this._schema = null) : (this._started = !0, this._schema = e, this._writeSchema(e))), this;
  }
  write(t) {
    let e = null;
    if (this._sink) {
      if (t == null)
        return this.finish() && void 0;
      if (t instanceof Q && !(e = t.schema))
        return this.finish() && void 0;
      if (t instanceof nt && !(e = t.schema))
        return this.finish() && void 0;
    } else throw new Error("RecordBatchWriter is closed");
    if (e && !fn(e, this._schema)) {
      if (this._started && this._autoDestroy)
        return this.close();
      this.reset(this._sink, e);
    }
    t instanceof nt ? t instanceof Un || this._writeRecordBatch(t) : t instanceof Q ? this.writeAll(t.batches) : We(t) && this.writeAll(t);
  }
  _writeMessage(t, e = 8) {
    const n = e - 1, s = X.encode(t), r = s.byteLength, o = this._writeLegacyIpcFormat ? 4 : 8, a = r + o + n & ~n, c = a - r - o;
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
    return this._writeMessage(X.from(t));
  }
  // @ts-ignore
  _writeFooter(t) {
    return this._writeLegacyIpcFormat ? this._write(Int32Array.of(0)) : this._write(Int32Array.of(-1, 0));
  }
  _writeMagic() {
    return this._write($e);
  }
  _writePadding(t) {
    return t > 0 ? this._write(new Uint8Array(t)) : this;
  }
  _writeRecordBatch(t) {
    const { byteLength: e, nodes: n, bufferRegions: s, buffers: r } = Y.assemble(t), o = new ct(t.numRows, n, s), a = X.from(o, e);
    return this._writeDictionaries(t)._writeMessage(a)._writeBodyBuffers(r);
  }
  _writeDictionaryBatch(t, e, n = !1) {
    const { byteLength: s, nodes: r, bufferRegions: o, buffers: a } = Y.assemble(new R([t])), c = new ct(t.length, r, o), u = new Nt(c, e, n), d = X.from(u, s);
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
class xn extends Io {
  /** @nocollapse */
  static writeAll(t, e) {
    const n = new xn(e);
    return te(t) ? t.then((s) => n.writeAll(s)) : De(t) ? jn(n, t) : Vn(n, t);
  }
}
class zn extends Io {
  /** @nocollapse */
  static writeAll(t) {
    const e = new zn();
    return te(t) ? t.then((n) => e.writeAll(n)) : De(t) ? jn(e, t) : Vn(e, t);
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
    const e = je.encode(new je(t, W.V5, this._recordBatchBlocks, this._dictionaryBlocks));
    return super._writeFooter(t)._write(e)._write(Int32Array.of(e.byteLength))._writeMagic();
  }
}
function Vn(i, t) {
  let e = t;
  t instanceof Q && (e = t.batches, i.reset(void 0, t.schema));
  for (const n of e)
    i.write(n);
  return i.finish();
}
function jn(i, t) {
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
function tl(i, t = "stream") {
  return (t === "stream" ? xn : zn).writeAll(i).toUint8Array(!0);
}
var el = Object.create, vo = Object.defineProperty, il = Object.getOwnPropertyDescriptor, nl = Object.getOwnPropertyNames, sl = Object.getPrototypeOf, rl = Object.prototype.hasOwnProperty, ol = (i, t) => () => (t || i((t = { exports: {} }).exports, t), t.exports), al = (i, t, e, n) => {
  if (t && typeof t == "object" || typeof t == "function") for (let s of nl(t)) !rl.call(i, s) && s !== e && vo(i, s, { get: () => t[s], enumerable: !(n = il(t, s)) || n.enumerable });
  return i;
}, cl = (i, t, e) => (e = i != null ? el(sl(i)) : {}, al(!i || !i.__esModule ? vo(e, "default", { value: i, enumerable: !0 }) : e, i)), ll = ol((i, t) => {
  t.exports = Worker;
}), ul = ((i) => (i[i.UNDEFINED = 0] = "UNDEFINED", i[i.AUTOMATIC = 1] = "AUTOMATIC", i[i.READ_ONLY = 2] = "READ_ONLY", i[i.READ_WRITE = 3] = "READ_WRITE", i))(ul || {}), dl = ((i) => (i[i.IDENTIFIER = 0] = "IDENTIFIER", i[i.NUMERIC_CONSTANT = 1] = "NUMERIC_CONSTANT", i[i.STRING_CONSTANT = 2] = "STRING_CONSTANT", i[i.OPERATOR = 3] = "OPERATOR", i[i.KEYWORD = 4] = "KEYWORD", i[i.COMMENT = 5] = "COMMENT", i))(dl || {}), hl = ((i) => (i[i.NONE = 0] = "NONE", i[i.DEBUG = 1] = "DEBUG", i[i.INFO = 2] = "INFO", i[i.WARNING = 3] = "WARNING", i[i.ERROR = 4] = "ERROR", i))(hl || {}), fl = ((i) => (i[i.NONE = 0] = "NONE", i[i.CONNECT = 1] = "CONNECT", i[i.DISCONNECT = 2] = "DISCONNECT", i[i.OPEN = 3] = "OPEN", i[i.QUERY = 4] = "QUERY", i[i.INSTANTIATE = 5] = "INSTANTIATE", i))(fl || {}), yl = ((i) => (i[i.NONE = 0] = "NONE", i[i.OK = 1] = "OK", i[i.ERROR = 2] = "ERROR", i[i.START = 3] = "START", i[i.RUN = 4] = "RUN", i[i.CAPTURE = 5] = "CAPTURE", i))(yl || {}), pl = ((i) => (i[i.NONE = 0] = "NONE", i[i.WEB_WORKER = 1] = "WEB_WORKER", i[i.NODE_WORKER = 2] = "NODE_WORKER", i[i.BINDINGS = 3] = "BINDINGS", i[i.ASYNC_DUCKDB = 4] = "ASYNC_DUCKDB", i))(pl || {}), ml = class {
  constructor(i = 2) {
    this.level = i;
  }
  log(i) {
    i.level >= this.level && console.log(i);
  }
}, _l = ((i) => (i[i.SUCCESS = 0] = "SUCCESS", i))(_l || {}), gl = class {
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
    let t = await this._bindings.runQuery(this._conn, i), e = ft.from(t);
    return console.assert(e.isSync(), "Reader is not sync"), console.assert(e.isFile(), "Reader is not file"), new Q(e);
  }
  async send(i) {
    this._bindings.logger.log({ timestamp: /* @__PURE__ */ new Date(), level: 2, origin: 4, topic: 4, event: 4, value: i });
    let t = await this._bindings.startPendingQuery(this._conn, i);
    for (; t == null; ) t = await this._bindings.pollPendingQuery(this._conn);
    let e = new So(this._bindings, this._conn, t), n = await ft.from(e);
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
    return new bl(this._bindings, this._conn, t);
  }
  async insertArrowTable(i, t) {
    let e = tl(i, "stream");
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
}, So = class {
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
}, bl = class {
  constructor(i, t, e) {
    this.bindings = i, this.connectionId = t, this.statementId = e;
  }
  async close() {
    await this.bindings.closePrepared(this.connectionId, this.statementId);
  }
  async query(...i) {
    let t = await this.bindings.runPrepared(this.connectionId, this.statementId, i), e = ft.from(t);
    return console.assert(e.isSync()), console.assert(e.isFile()), new Q(e);
  }
  async send(...i) {
    let t = await this.bindings.sendPrepared(this.connectionId, this.statementId, i), e = new So(this.bindings, this.connectionId, t), n = await ft.from(e);
    return console.assert(n.isAsync()), console.assert(n.isStream()), n;
  }
}, wl = ((i) => (i.CANCEL_PENDING_QUERY = "CANCEL_PENDING_QUERY", i.CLOSE_PREPARED = "CLOSE_PREPARED", i.COLLECT_FILE_STATISTICS = "COLLECT_FILE_STATISTICS", i.CONNECT = "CONNECT", i.COPY_FILE_TO_BUFFER = "COPY_FILE_TO_BUFFER", i.COPY_FILE_TO_PATH = "COPY_FILE_TO_PATH", i.CREATE_PREPARED = "CREATE_PREPARED", i.DISCONNECT = "DISCONNECT", i.DROP_FILE = "DROP_FILE", i.DROP_FILES = "DROP_FILES", i.EXPORT_FILE_STATISTICS = "EXPORT_FILE_STATISTICS", i.FETCH_QUERY_RESULTS = "FETCH_QUERY_RESULTS", i.FLUSH_FILES = "FLUSH_FILES", i.GET_FEATURE_FLAGS = "GET_FEATURE_FLAGS", i.GET_TABLE_NAMES = "GET_TABLE_NAMES", i.GET_VERSION = "GET_VERSION", i.GLOB_FILE_INFOS = "GLOB_FILE_INFOS", i.INSERT_ARROW_FROM_IPC_STREAM = "INSERT_ARROW_FROM_IPC_STREAM", i.INSERT_CSV_FROM_PATH = "IMPORT_CSV_FROM_PATH", i.INSERT_JSON_FROM_PATH = "IMPORT_JSON_FROM_PATH", i.INSTANTIATE = "INSTANTIATE", i.OPEN = "OPEN", i.PING = "PING", i.POLL_PENDING_QUERY = "POLL_PENDING_QUERY", i.REGISTER_FILE_BUFFER = "REGISTER_FILE_BUFFER", i.REGISTER_FILE_HANDLE = "REGISTER_FILE_HANDLE", i.REGISTER_FILE_URL = "REGISTER_FILE_URL", i.RESET = "RESET", i.RUN_PREPARED = "RUN_PREPARED", i.RUN_QUERY = "RUN_QUERY", i.SEND_PREPARED = "SEND_PREPARED", i.START_PENDING_QUERY = "START_PENDING_QUERY", i.TOKENIZE = "TOKENIZE", i))(wl || {}), Il = ((i) => (i.CONNECTION_INFO = "CONNECTION_INFO", i.ERROR = "ERROR", i.FEATURE_FLAGS = "FEATURE_FLAGS", i.FILE_BUFFER = "FILE_BUFFER", i.FILE_INFOS = "FILE_INFOS", i.FILE_SIZE = "FILE_SIZE", i.FILE_STATISTICS = "FILE_STATISTICS", i.INSTANTIATE_PROGRESS = "INSTANTIATE_PROGRESS", i.LOG = "LOG", i.OK = "OK", i.PREPARED_STATEMENT_ID = "PREPARED_STATEMENT_ID", i.QUERY_PLAN = "QUERY_PLAN", i.QUERY_RESULT = "QUERY_RESULT", i.QUERY_RESULT_CHUNK = "QUERY_RESULT_CHUNK", i.QUERY_RESULT_HEADER = "QUERY_RESULT_HEADER", i.QUERY_RESULT_HEADER_OR_NULL = "QUERY_RESULT_HEADER_OR_NULL", i.REGISTERED_FILE = "REGISTERED_FILE", i.SCRIPT_TOKENS = "SCRIPT_TOKENS", i.SUCCESS = "SUCCESS", i.TABLE_NAMES = "TABLE_NAMES", i.VERSION_STRING = "VERSION_STRING", i))(Il || {}), E = class {
  constructor(i, t) {
    this.promiseResolver = () => {
    }, this.promiseRejecter = () => {
    }, this.type = i, this.data = t, this.promise = new Promise((e, n) => {
      this.promiseResolver = e, this.promiseRejecter = n;
    });
  }
};
function ui(i) {
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
      return { sqlType: "list", valueType: ui(i.valueType) };
    case l.FixedSizeBinary:
      return { sqlType: "fixedsizebinary", byteWidth: i.byteWidth };
    case l.Null:
      return { sqlType: "null" };
    case l.Utf8:
      return { sqlType: "utf8" };
    case l.Struct:
      return { sqlType: "struct", fields: i.children.map((t) => mn(t.name, t.type)) };
    case l.Map: {
      let t = i;
      return { sqlType: "map", keyType: ui(t.keyType), valueType: ui(t.valueType) };
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
function mn(i, t) {
  let e = ui(t);
  return e.name = i, e;
}
var vl = new TextEncoder(), Sl = class {
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
    return new gl(this, i);
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
    let e = vl.encode(t);
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
        s.push(mn(r, o));
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
        s.push(mn(r, o));
      }
      e.columnsFlat = s, delete e.columns;
    }
    let n = new E("IMPORT_JSON_FROM_PATH", [i, t, e]);
    await this.postTask(n);
  }
}, Bl = { version: "1.29.0" }, $n = Bl.version.split(".");
$n[0];
$n[1];
$n[2];
cl(ll());
function Dl() {
  let i = new TextDecoder();
  return (t) => (typeof SharedArrayBuffer < "u" && t.buffer instanceof SharedArrayBuffer && (t = new Uint8Array(t)), i.decode(t));
}
Dl();
var Al = ((i) => (i[i.BUFFER = 0] = "BUFFER", i[i.NODE_FS = 1] = "NODE_FS", i[i.BROWSER_FILEREADER = 2] = "BROWSER_FILEREADER", i[i.BROWSER_FSACCESS = 3] = "BROWSER_FSACCESS", i[i.HTTP = 4] = "HTTP", i[i.S3 = 5] = "S3", i))(Al || {});
const k = {
  config: null,
  duckDbPromise: null,
  monthCache: /* @__PURE__ */ new Map(),
  registeredFiles: /* @__PURE__ */ new Set()
};
function Tl(i) {
  return i ? i.endsWith("/") ? i.slice(0, -1) : i : "/lib/duckdb-wasm";
}
function Yn(i) {
  if (!i)
    throw new Error("DuckDB configuration is required.");
  if (k.config)
    return k.config;
  const t = Tl(i.bundleBasePath ?? i.BundleBasePath ?? "/lib/duckdb-wasm"), e = i.moduleLoader ?? i.ModuleLoader ?? "duckdb-browser-bundle.js", n = i.mainModule ?? i.MainModule ?? "duckdb-eh.wasm", s = i.pthreadWorker ?? i.PthreadWorker ?? "duckdb-browser-coi.pthread.worker.js", r = i.mainWorker ?? i.MainWorker ?? "duckdb-browser-eh.worker.js";
  return k.config = {
    bundleBasePath: t,
    moduleLoader: e,
    mainModule: n,
    pthreadWorker: s || null,
    mainWorker: r
  }, k.config;
}
function Xi(i, t) {
  return `${i}/${t}`;
}
async function Ye() {
  if (!k.config)
    throw new Error("Call initialize before using DuckDB.");
  return k.duckDbPromise || (k.duckDbPromise = (async () => {
    const i = Xi(k.config.bundleBasePath, k.config.mainWorker), t = new Worker(i, { type: "module" }), e = new ml(), n = new Sl(e, t), s = Xi(k.config.bundleBasePath, k.config.mainModule), r = k.config.pthreadWorker ? Xi(k.config.bundleBasePath, k.config.pthreadWorker) : void 0;
    return await n.instantiate(s, r), { db: n, worker: t };
  })()), k.duckDbPromise;
}
function Bo(i, t) {
  return `${i}-${t}`;
}
function Fl(i) {
  const t = Array.isArray(i?.Days) ? i.Days : Array.isArray(i?.days) ? i.days : [], e = /* @__PURE__ */ new Map();
  for (const n of t) {
    const s = n?.Day ?? n?.day;
    if (typeof s != "number")
      continue;
    const o = (Array.isArray(n?.Files) ? n.Files : Array.isArray(n?.files) ? n.files : []).map((a) => a?.Key ?? a?.key).filter((a) => typeof a == "string" && a.length > 0).sort((a, c) => a.localeCompare(c));
    e.set(s, o);
  }
  return {
    manifest: i,
    dayFiles: e,
    downloadedDays: /* @__PURE__ */ new Set()
  };
}
async function Ol(i, t) {
  const e = await fetch(`api/parquet/month/${i}/${t}`);
  if (!e.ok)
    throw new Error(`Failed to download manifest (${e.status})`);
  return e.json();
}
function El(i) {
  return `parquet/${i}`;
}
async function Nl(i, t) {
  const e = i.dayFiles.get(t);
  if (!e || e.length === 0)
    return [];
  const { db: n } = await Ye(), s = [];
  for (const r of e) {
    const o = El(r);
    if (!k.registeredFiles.has(o)) {
      const a = await fetch(`api/parquet/file?key=${encodeURIComponent(r)}`);
      if (!a.ok)
        throw new Error(`Failed to download parquet file (${a.status})`);
      const c = new Uint8Array(await a.arrayBuffer());
      await n.registerFileBuffer(o, c), k.registeredFiles.add(o);
    }
    s.push(o);
  }
  return i.downloadedDays.add(t), s;
}
function Rl(i) {
  return i.length === 1 ? JSON.stringify(i[0]) : `[${i.map((e) => JSON.stringify(e)).join(", ")}]`;
}
function tn(i) {
  return i.replace(/\\/g, "\\\\").replace(/'/g, "''");
}
function Ll(i) {
  const t = i.trim();
  return /[%_]/.test(t) ? t : `%${t}%`;
}
function Ul(i) {
  return i == null ? null : typeof i == "bigint" ? Number(i) : Array.isArray(i) || typeof i == "object" && i !== null ? JSON.stringify(i) : i;
}
function Ml(i, t) {
  const e = {};
  for (const n of t)
    e[n] = Ul(i[n]);
  return e;
}
function en(i, t, e) {
  const n = i?.[t] ?? i?.[e];
  return typeof n == "string" && n.trim().length > 0 ? n.trim() : null;
}
function Xe(i, t, e) {
  const n = i?.[t] ?? i?.[e];
  if (typeof n == "number" && Number.isFinite(n))
    return n;
  if (typeof n == "string" && n.length > 0) {
    const s = Number.parseInt(n, 10);
    return Number.isFinite(s) ? s : null;
  }
  return null;
}
async function Pl(i) {
  Yn(i), await Ye();
}
async function kl(i, t) {
  const e = Number.parseInt(i, 10), n = Number.parseInt(t, 10);
  if (!Number.isFinite(e) || !Number.isFinite(n))
    throw new Error("Year and month must be numeric.");
  Yn(k.config ?? {}), await Ye();
  const s = Bo(e, n);
  let r = k.monthCache.get(s);
  if (!r) {
    const a = await Ol(e, n);
    r = Fl(a), k.monthCache.set(s, r);
  }
  const o = Array.from(r.downloadedDays).sort((a, c) => a - c);
  return {
    Manifest: r.manifest,
    DownloadedDays: o
  };
}
async function xl(i) {
  if (!i)
    throw new Error("A query request is required.");
  const t = Xe(i, "Year", "year"), e = Xe(i, "Month", "month"), n = Xe(i, "Day", "day");
  if (t === null || e === null || n === null)
    throw new Error("Year, month, and day are required.");
  Yn(k.config ?? {}), await Ye();
  const s = Bo(t, e), r = k.monthCache.get(s);
  if (!r)
    throw new Error("Month manifest is not loaded.");
  const o = await Nl(r, n);
  if (o.length === 0)
    return [];
  const a = i?.SelectColumns ?? i?.selectColumns ?? "*", c = [], u = en(i, "Email", "email");
  if (u) {
    const _t = Ll(u);
    c.push(`email ILIKE '${tn(_t)}' ESCAPE '\\'`);
  }
  const d = en(i, "EventType", "eventType");
  d && c.push(`event = '${tn(d)}'`);
  const h = en(i, "SgTemplateId", "sgTemplateId");
  h && c.push(`sg_template_id = '${tn(h)}'`);
  const V = Xe(i, "Limit", "limit"), F = V && V > 0 ? ` LIMIT ${Math.min(V, 5e3)}` : "", G = c.length > 0 ? ` WHERE ${c.join(" AND ")}` : "", Vt = `SELECT ${a} FROM read_parquet(${Rl(o)}, union_by_name=true)${G} ORDER BY Timestamp DESC${F}`, { db: Te } = await Ye(), mt = await Te.connect();
  try {
    const _t = await mt.query(Vt), Do = Array.isArray(_t?.schema?.fields) ? _t.schema.fields.map((ne) => ne?.name).filter((ne) => typeof ne == "string" && ne.length > 0) : [], Ao = _t.toArray().map((ne) => Ml(ne, Do));
    return typeof _t.close == "function" ? _t.close() : typeof _t.release == "function" && _t.release(), Ao;
  } finally {
    await mt.close();
  }
}
async function zl() {
  if (k.duckDbPromise)
    try {
      const i = await k.duckDbPromise;
      await i.db.terminate(), i.worker.terminate();
    } finally {
      k.duckDbPromise = null, k.monthCache.clear(), k.registeredFiles.clear();
    }
}
function Vl() {
  return k;
}
export {
  Vl as __getInternalState,
  zl as dispose,
  kl as ensureMonthPrepared,
  Pl as initialize,
  xl as queryEvents
};
//# sourceMappingURL=duckdb-browser-bundle.js.map
