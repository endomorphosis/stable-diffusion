'use strict';

var require$$2 = require('os');
var require$$0 = require('fs');
var path$1 = require('path');
var require$$7 = require('url');
var require$$0$2 = require('stream');
var require$$0$1 = require('zlib');
var require$$3 = require('net');
var require$$4 = require('tls');
var require$$5 = require('crypto');
var require$$0$3 = require('events');
var require$$1 = require('https');
var require$$2$1 = require('http');

function _interopDefaultLegacy(e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$2__default = /*#__PURE__*/ _interopDefaultLegacy(require$$2);
var require$$0__default = /*#__PURE__*/ _interopDefaultLegacy(require$$0);
var path__default = /*#__PURE__*/ _interopDefaultLegacy(path$1);
var require$$7__default = /*#__PURE__*/ _interopDefaultLegacy(require$$7);
var require$$0__default$2 = /*#__PURE__*/ _interopDefaultLegacy(require$$0$2);
var require$$0__default$1 = /*#__PURE__*/ _interopDefaultLegacy(require$$0$1);
var require$$3__default = /*#__PURE__*/ _interopDefaultLegacy(require$$3);
var require$$4__default = /*#__PURE__*/ _interopDefaultLegacy(require$$4);
var require$$5__default = /*#__PURE__*/ _interopDefaultLegacy(require$$5);
var require$$0__default$3 = /*#__PURE__*/ _interopDefaultLegacy(require$$0$3);
var require$$1__default = /*#__PURE__*/ _interopDefaultLegacy(require$$1);
var require$$2__default$1 = /*#__PURE__*/ _interopDefaultLegacy(require$$2$1);

var main = { exports: {} };

const fs = require$$0__default["default"];
const path = path__default["default"];
const os = require$$2__default["default"];

const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;

// Parser src into an Object
function parse$2(src) {
    const obj = {};

    // Convert buffer to string
    let lines = src.toString();

    // Convert line breaks to same format
    lines = lines.replace(/\r\n?/mg, '\n');

    let match;
    while ((match = LINE.exec(lines)) != null) {
        const key = match[1];

        // Default undefined or null to empty string
        let value = (match[2] || '');

        // Remove whitespace
        value = value.trim();

        // Check if double quoted
        const maybeQuote = value[0];

        // Remove surrounding quotes
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2');

        // Expand newlines if double quoted
        if (maybeQuote === '"') {
            value = value.replace(/\\n/g, '\n');
            value = value.replace(/\\r/g, '\r');
        }

        // Add to object
        obj[key] = value;
    }

    return obj
}

function _log(message) {
    console.log(`[dotenv][DEBUG] ${message}`);
}

function _resolveHome(envPath) {
    return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath
}

// Populates process.env from .env file
function config(options) {
    let dotenvPath = path.resolve(process.cwd(), '.env');
    let encoding = 'utf8';
    const debug = Boolean(options && options.debug);
    const override = Boolean(options && options.override);

    if (options) {
        if (options.path != null) {
            dotenvPath = _resolveHome(options.path);
        }
        if (options.encoding != null) {
            encoding = options.encoding;
        }
    }

    try {
        // Specifying an encoding returns a string instead of a buffer
        const parsed = DotenvModule.parse(fs.readFileSync(dotenvPath, { encoding }));

        Object.keys(parsed).forEach(function(key) {
            if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
                process.env[key] = parsed[key];
            } else {
                if (override === true) {
                    process.env[key] = parsed[key];
                }

                if (debug) {
                    if (override === true) {
                        _log(`"${key}" is already defined in \`process.env\` and WAS overwritten`);
                    } else {
                        _log(`"${key}" is already defined in \`process.env\` and was NOT overwritten`);
                    }
                }
            }
        });

        return { parsed }
    } catch (e) {
        if (debug) {
            _log(`Failed to load ${dotenvPath} ${e.message}`);
        }

        return { error: e }
    }
}

const DotenvModule = {
    config,
    parse: parse$2
};

main.exports.config = DotenvModule.config;
main.exports.parse = DotenvModule.parse;
main.exports = DotenvModule;

const timeScalars = [
    1000,
    60,
    60,
    24,
    7,
    52
];

const timeUnits = [
    'ms',
    'seconds',
    'minutes',
    'hours',
    'days',
    'weeks',
    'years'
];

const humanDuration = (ms, dp = 0) => {
    let timeScalarIndex = 0;
    let scaledTime = ms;

    while (scaledTime > timeScalars[timeScalarIndex]) {
        scaledTime /= timeScalars[timeScalarIndex++];
    }

    return `${scaledTime.toFixed(dp)} ${timeUnits[timeScalarIndex]}`
};

function trace() {
    let stack = getStack();
    let file = stack[3];

    if (!file)
        return {
            file: '?',
            name: '?',
            stack: []
        }

    let name = path__default["default"].basename(file)
        .replace(/\.js$/, '');

    return { file, name, stack }
}

function diff(base, trace) {
    if (path__default["default"].dirname(base.file) === path__default["default"].dirname(trace.file))
        return { root: true, name: trace.name }

    let relative = path__default["default"].relative(
        path__default["default"].dirname(base.file),
        trace.file
    );

    let name = relative
        .replace(/\.js$/, '');

    return { name }
}


function getStack() {
    let originalFunc = Error.prepareStackTrace;
    let error = new Error();

    Error.prepareStackTrace = (error, stack) => stack;

    let stack = error.stack
        .map(entry => entry.getFileName())
        .filter(Boolean)
        .filter(file => file.startsWith('file:'))
        .map(file => require$$7.fileURLToPath(file));

    Error.prepareStackTrace = originalFunc;

    return stack
}

const colors = {
    red: '31m',
    green: '32m',
    yellow: '33m',
    blue: '34m',
    cyan: '36m',
    magenta: '35m',
    pink: '38;5;197m',
};

function std({ level, date, name, color, contents }) {
    let func = level === 'E' ?
        console.error :
        console.log;

    func(`${date} ${level} [\x1b[${colors[color]}${name}\x1b[0m]`, ...contents);
}

const levelCascades = {
    D: ['debug'],
    I: ['debug', 'info'],
    W: ['debug', 'info', 'warn'],
    E: ['debug', 'info', 'warn', 'error'],
};


function create(config) {
    let accumulations = {};
    let timings = {};
    let traceBase;
    let pipe;
    let output = std;


    function applyConfig(newConfig) {
        config = {
            name: newConfig.name,
            color: newConfig.color || 'yellow',
            severity: newConfig.severity || 'debug'
        };
    }


    function write({ level, args, trace }) {
        let name = config.name;
        let color = config.color;
        let severity = config.severity;

        if (!levelCascades[level].includes(severity))
            return

        if (pipe) {
            pipe({ level, args, trace });
            return
        }

        if (!name) {
            if (traceBase) {
                let { name: diffName, root } = diff(traceBase, trace);

                name = diffName;

                if (!root)
                    color = 'cyan';
            } else {
                name = trace.name;
            }
        }

        output({
            level,
            name,

            date: new Date()
                .toISOString()
                .slice(0, 19)
                .replace('T', ' '),

            color: level === 'E' ?
                'red' :
                color,

            contents: args.map(arg => {
                if (typeof arg === 'number')
                    return arg.toLocaleString('en-US')

                if (arg && arg.stack)
                    return arg.stack

                return arg
            })
        });
    }

    function time({ level, trace, key, contents }) {
        if (timings[key]) {
            let time = process.hrtime(timings[key]);
            let timeInMs = (time[0] * 1000000000 + time[1]) / 1000000;
            let duration = humanDuration(timeInMs, 1);

            write({
                level,
                trace,
                args: contents.map(
                    arg => typeof arg === 'string' ?
                    arg.replace('%', duration) :
                    arg
                )
            });

            delete timings[key];
        } else {
            timings[key] = process.hrtime();

            if (contents.length > 0)
                write({ level, trace, args: contents });
        }
    }

    function accumulate({ level, trace, args: { id, text, data = {}, timeout = 10000 } }) {
        if (!id) {
            id = Object.keys(data).join('+');
        }

        let accumulation = accumulations[id];

        if (!accumulation) {
            accumulations[id] = accumulation = {
                start: Date.now(),
                timeout,
                data: {},
                flush: () => {
                    let data = {
                        ...accumulation.data,
                        time: humanDuration(Date.now() - accumulation.start)
                    };

                    clearTimeout(accumulation.timer);

                    write({
                        level,
                        trace,
                        args: accumulation.text.map(piece => {
                            for (let [k, v] of Object.entries(data)) {
                                if (typeof(piece) === 'string')
                                    piece = piece.replace(`%${k}`, v.toLocaleString('en-US'));
                            }

                            return piece
                        })
                    });

                    delete accumulations[id];
                }
            };

            accumulation.timer = setTimeout(accumulation.flush, timeout);
        }

        for (let [k, v] of Object.entries(data)) {
            accumulation.data[k] = (accumulation.data[k] || 0) + v;
        }

        accumulation.text = text;

        if (Date.now() - accumulation.start >= timeout)
            accumulation.flush();
    }

    applyConfig(config);

    return {
        config(newConfig) {
            traceBase = trace();
            applyConfig(newConfig);
        },
        fork(branchConfig) {
            return create({
                ...config,
                ...branchConfig,
            })
        },
        branch(branchConfig) {
            return create({
                ...config,
                ...branchConfig,
                name: `${name}/${branchConfig.name}`
            })
        },
        debug(...args) {
            write({ level: 'D', args, trace: trace() });
        },
        info(...args) {
            write({ level: 'I', args, trace: trace() });
        },
        warn(...args) {
            write({ level: 'W', args, trace: trace() });
        },
        error(...args) {
            write({ level: 'E', args, trace: trace() });
        },
        time: {
            debug(key, ...contents) {
                time({ level: 'D', key, contents, trace: trace() });
            },
            info(key, ...contents) {
                time({ level: 'I', key, contents, trace: trace() });
            },
            warn(key, ...contents) {
                time({ level: 'W', key, contents, trace: trace() });
            },
            error(key, ...contents) {
                time({ level: 'E', key, contents, trace: trace() });
            }
        },
        accumulate: {
            debug(args) {
                accumulate({ level: 'D', args, trace: trace() });
            },
            info(args) {
                accumulate({ level: 'I', args, trace: trace() });
            },
            warn(args) {
                accumulate({ level: 'W', args, trace: trace() });
            },
            error(args) {
                accumulate({ level: 'E', args, trace: trace() });
            }
        },
        flush() {
            for (let accumulation of Object.values(accumulations)) {
                accumulation.flush();
            }
        },
        write(line) {
            write(line);
        },
        pipe(logger) {
            pipe = logger.write;
        }
    }
}

var log = create({});

class ProtocolBuffer {
    static parseConfig(config) {
        let parseField = f => {
            let parts = f.split(':');
            let is_array = parts[1].charAt(0) === '[';

            if (is_array)
                parts[1] = parts[1].slice(1, -1);

            let typeparts = parts[1].split('.');

            return {
                key: parts[0],
                type: typeparts[0],
                subtype: typeparts[1],
                array: is_array
            }
        };

        let populateField = f => {
            let field = Object.assign({}, f);

            switch (f.type) {
                case 'enum':
                    field.values = config.enums.find(e => e.id === f.subtype).values;
                    field.bytes = 1;
                    break
                case 'struct':
                    field.fields = structs.find(s => s.id === f.subtype).fields;
                    break
                case 'json':
                    break
                default:
                    field.bytes = ProtocolBuffer.typedef[f.type].bytes;
                    break
            }

            return field
        };


        let structs = (config.structs || []).map(struct => Object.assign(struct, {
            fields: struct.fields.map(f => parseField(f))
        }));

        structs.forEach(struct => {
            struct.fields = struct.fields.map(f => populateField(f));
        });

        let parsed = {
            messages: {},
            buffers: config.buffers
        };

        parsed.messages.list = config.messages.map((m, i) => Object.assign({}, m, {
            fields: m.fields.map(f => populateField(parseField(f))),
            index: i
        }));

        parsed.messages.dict = parsed.messages.list.reduce((dict, msg) => {
            dict[msg.id] = msg;
            return dict
        }, {});

        return parsed
    }


    constructor(config) {
        this.config = ProtocolBuffer.parseConfig(config);
        this.encode_buffer = new Uint8Array(this.config.buffers.encoder.bytes);
        this.encoder = new DataView(this.encode_buffer.buffer);
        this.decode_buffer = new Uint8Array(this.config.buffers.decoder.bytes);
        this.decoder = new DataView(this.decode_buffer.buffer);
    }

    encode(type, payload) {
        let cfg = this.config.messages.dict[type];
        let len = 0;

        if (!cfg) {
            throw new TypeError(`Undefined message type: ${type}`)
        }

        this.writeEncodedPrimitive('uint8', 0, cfg.index);
        len += 1;
        len += this.encodeFields(cfg.fields, len, payload);

        return this.encode_buffer.subarray(0, len)
    }

    encodeFields(fields, offset, data) {
        let count = fields.length;
        let len = 0;
        let data_is_array = Array.isArray(data);

        for (var i = 0; i < count; i++) {
            let field = fields[i];
            let value = data_is_array ? data[i] : data[field.key];

            switch (field.type) {
                case 'struct':
                    if (field.array) {
                        this.writeEncodedPrimitive('uint16', offset + len, value.length);
                        len += 2;

                        for (var u = 0; u < value.length; u++) {
                            len += this.encodeFields(field.fields, offset + len, value[u]);
                        }
                    } else {
                        len += this.encodeFields(field.fields, offset + len, value);

                    }

                    break
                case 'enum':
                    this.writeEncodedPrimitive('uint8', offset + len, field.values.indexOf(value));
                    len += 1;
                    break
                case 'json':
                    value = JSON.stringify(value);
                case 'string':
                    let strlen = this.writeEncodedString(offset + len + 2, value);
                    this.writeEncodedPrimitive('uint16', offset + len, strlen);
                    len += strlen + 2;
                    break
                case 'blob':
                    let bloblen = this.writeBlob(offset + len + 4, value);
                    this.writeEncodedPrimitive('uint32', offset + len, bloblen);
                    len += bloblen + 4;
                    break
                default:
                    this.writeEncodedPrimitive(field.type, offset + len, value);
                    len += field.bytes;
                    break
            }
        }

        return len
    }

    writeEncodedPrimitive(type, offset, value) {
        switch (type) {
            case 'uint8':
                this.encoder.setUint8(offset, value);
                break
            case 'uint16':
                this.encoder.setUint16(offset, value);
                break
            case 'uint32':
                this.encoder.setUint32(offset, value);
                break
            case 'uint64':
                this.encoder.setBigUint64(offset, BigInt(value));
                break
            case 'int8':
                this.encoder.setInt8(offset, value);
                break
            case 'int16':
                this.encoder.setInt16(offset, value);
                break
            case 'int32':
                this.encoder.setInt32(offset, value);
                break
            case 'int64':
                this.encoder.setBigInt64(offset, BigInt(value));
                break
            case 'float32':
                this.encoder.setFloat32(offset, value);
                break
            case 'float64':
                this.encoder.setFloat64(offset, value);
                break
            case 'bool':
                this.encoder.setUint8(offset, +value);
                break
        }
    }

    writeEncodedString(offset, str) {
        let len = 0;

        for (var i = 0; i < str.length; i++) {
            let charcode = str.charCodeAt(i);

            if (charcode < 0x80) {
                this.writeEncodedPrimitive('uint8', offset + len++, charcode);
            } else if (charcode < 0x800) {
                this.writeEncodedPrimitive('uint8', offset + len++, 0xc0 | (charcode >> 6));
                this.writeEncodedPrimitive('uint8', offset + len++, 0x80 | (charcode & 0x3f));
            } else if (charcode < 0xd800 || charcode >= 0xe000) {
                this.writeEncodedPrimitive('uint8', offset + len++, 0xe0 | (charcode >> 12));
                this.writeEncodedPrimitive('uint8', offset + len++, 0x80 | ((charcode >> 6) & 0x3f));
                this.writeEncodedPrimitive('uint8', offset + len++, 0x80 | (charcode & 0x3f));
            } else {
                i++;
                charcode = 0x10000 + (((charcode & 0x3ff) << 10) |
                    (str.charCodeAt(i) & 0x3ff));

                this.writeEncodedPrimitive('uint8', offset + len++, 0xf0 | (charcode >> 18));
                this.writeEncodedPrimitive('uint8', offset + len++, 0x80 | ((charcode >> 12) & 0x3f));
                this.writeEncodedPrimitive('uint8', offset + len++, 0x80 | ((charcode >> 6) & 0x3f));
                this.writeEncodedPrimitive('uint8', offset + len++, 0x80 | (charcode & 0x3f));
            }
        }

        return len
    }

    writeBlob(offset, blob) {
        this.encode_buffer.set(blob, offset);
        return blob.length
    }


    decode(buffer) {
        if (buffer.length > this.config.buffers.decoder.bytes)
            return null

        let array = new Uint8Array(buffer);
        this.decode_buffer.set(array);

        let cfg = this.config.messages.list[this.decoder.getUint8(0)];

        if (!cfg)
            return null

        let data = {};

        try {
            this.decodeFields(cfg.fields, 1, data);
        } catch {
            return null
        }

        return {
            type: cfg.id,
            payload: data
        }
    }

    decodeFields(fields, offset, data) {
        let count = fields.length;
        let pos = 0;

        for (var i = 0; i < count; i++) {
            let field = fields[i];
            let value;

            switch (field.type) {
                case 'struct':
                    if (field.array) {
                        let structcount = this.readEncodedPrimitive('uint16', offset + pos);
                        pos += 2;

                        value = [];

                        for (var u = 0; u < structcount; u++) {
                            let entry = {};
                            pos += this.decodeFields(field.fields, offset + pos, entry);
                            value.push(entry);
                        }
                    } else {
                        value = {};
                        pos += this.decodeFields(field.fields, offset + pos, value);
                    }

                    break
                case 'enum':
                    value = field.values[this.readEncodedPrimitive('uint8', offset + pos)];
                    pos += 1;
                    break
                case 'json':
                case 'string':
                    let strlen = this.readEncodedPrimitive('uint16', offset + pos);
                    value = this.readEncodedString(offset + pos + 2, strlen);
                    pos += strlen + 2;

                    if (field.type === 'json')
                        value = JSON.parse(value);
                    break
                case 'blob':
                    let bloblen = this.readEncodedPrimitive('uint32', offset + pos);
                    value = this.readBlob(offset + pos + 4, bloblen);
                    pos += bloblen + 4;
                    break
                default:
                    value = this.readEncodedPrimitive(field.type, offset + pos);
                    pos += field.bytes;
                    break
            }

            data[field.key] = value;
        }

        return pos
    }

    readEncodedPrimitive(type, offset) {
        switch (type) {
            case 'uint8':
                return this.decoder.getUint8(offset)
            case 'uint16':
                return this.decoder.getUint16(offset)
            case 'uint32':
                return this.decoder.getUint32(offset)
            case 'uint64':
                return this.decoder.getBigUint64(offset)
            case 'int8':
                return this.decoder.getInt8(offset)
            case 'int16':
                return this.decoder.getInt16(offset)
            case 'int32':
                return this.decoder.getInt32(offset)
            case 'int64':
                return this.decoder.getBigInt64(offset)
            case 'float32':
                return this.decoder.getFloat32(offset)
            case 'float64':
                return this.decoder.getFloat64(offset)
            case 'bool':
                return !!this.decoder.getUint8(offset)
        }
    }

    readEncodedString(offset, len) {
        let pos = 0;
        let str = '';
        let char;

        while (pos < len) {
            char = this.readEncodedPrimitive('uint8', offset + pos++);

            switch (char >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    str += String.fromCharCode(char);
                    break;
                case 12:
                case 13:
                    str += String.fromCharCode(
                        ((char & 0x1F) << 6) |
                        (this.readEncodedPrimitive('uint8', offset + pos++) & 0x3F)
                    );
                    break;
                case 14:
                    str += String.fromCharCode(
                        ((char & 0x0F) << 12) |
                        ((this.readEncodedPrimitive('uint8', offset + pos++) & 0x3F) << 6) |
                        ((this.readEncodedPrimitive('uint8', offset + pos++) & 0x3F) << 0)
                    );
                    break;
            }
        }

        return str
    }

    readBlob(offset, len) {
        return this.decode_buffer.slice(offset, offset + len)
    }
}

ProtocolBuffer.typedef = {
    uint8: { bytes: 1 },
    uint16: { bytes: 2 },
    uint32: { bytes: 4 },
    uint64: { bytes: 8 },
    int8: { bytes: 1 },
    int16: { bytes: 2 },
    int32: { bytes: 4 },
    int64: { bytes: 8 },
    bool: { bytes: 1 },
    float32: { bytes: 4 },
    float64: { bytes: 8 },
    blob: { bytes: undefined },
    string: { bytes: undefined },
};

var bufferUtil$1 = { exports: {} };

var constants = {
    BINARY_TYPES: ['nodebuffer', 'arraybuffer', 'fragments'],
    EMPTY_BUFFER: Buffer.alloc(0),
    GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
    kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
    kListener: Symbol('kListener'),
    kStatusCode: Symbol('status-code'),
    kWebSocket: Symbol('websocket'),
    NOOP: () => {}
};

var unmask$1;
var mask;

const { EMPTY_BUFFER: EMPTY_BUFFER$3 } = constants;

/**
 * Merges an array of buffers into a new buffer.
 *
 * @param {Buffer[]} list The array of buffers to concat
 * @param {Number} totalLength The total length of buffers in the list
 * @return {Buffer} The resulting buffer
 * @public
 */
function concat$1(list, totalLength) {
    if (list.length === 0) return EMPTY_BUFFER$3;
    if (list.length === 1) return list[0];

    const target = Buffer.allocUnsafe(totalLength);
    let offset = 0;

    for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
    }

    if (offset < totalLength) return target.slice(0, offset);

    return target;
}

/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 * @public
 */
function _mask(source, mask, output, offset, length) {
    for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
    }
}

/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 * @public
 */
function _unmask(buffer, mask) {
    for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
    }
}

/**
 * Converts a buffer to an `ArrayBuffer`.
 *
 * @param {Buffer} buf The buffer to convert
 * @return {ArrayBuffer} Converted buffer
 * @public
 */
function toArrayBuffer$1(buf) {
    if (buf.byteLength === buf.buffer.byteLength) {
        return buf.buffer;
    }

    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

/**
 * Converts `data` to a `Buffer`.
 *
 * @param {*} data The data to convert
 * @return {Buffer} The buffer
 * @throws {TypeError}
 * @public
 */
function toBuffer$2(data) {
    toBuffer$2.readOnly = true;

    if (Buffer.isBuffer(data)) return data;

    let buf;

    if (data instanceof ArrayBuffer) {
        buf = Buffer.from(data);
    } else if (ArrayBuffer.isView(data)) {
        buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    } else {
        buf = Buffer.from(data);
        toBuffer$2.readOnly = false;
    }

    return buf;
}

bufferUtil$1.exports = {
    concat: concat$1,
    mask: _mask,
    toArrayBuffer: toArrayBuffer$1,
    toBuffer: toBuffer$2,
    unmask: _unmask
};

/* istanbul ignore else  */
if (!process.env.WS_NO_BUFFER_UTIL) {
    try {
        const bufferUtil = require('bufferutil');

        mask = bufferUtil$1.exports.mask = function(source, mask, output, offset, length) {
            if (length < 48) _mask(source, mask, output, offset, length);
            else bufferUtil.mask(source, mask, output, offset, length);
        };

        unmask$1 = bufferUtil$1.exports.unmask = function(buffer, mask) {
            if (buffer.length < 32) _unmask(buffer, mask);
            else bufferUtil.unmask(buffer, mask);
        };
    } catch (e) {
        // Continue regardless of the error.
    }
}

const kDone = Symbol('kDone');
const kRun = Symbol('kRun');

/**
 * A very simple job queue with adjustable concurrency. Adapted from
 * https://github.com/STRML/async-limiter
 */
class Limiter$1 {
    /**
     * Creates a new `Limiter`.
     *
     * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
     *     to run concurrently
     */
    constructor(concurrency) {
        this[kDone] = () => {
            this.pending--;
            this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
    }

    /**
     * Adds a job to the queue.
     *
     * @param {Function} job The job to run
     * @public
     */
    add(job) {
        this.jobs.push(job);
        this[kRun]();
    }

    /**
     * Removes a job from the queue and runs it if possible.
     *
     * @private
     */
    [kRun]() {
        if (this.pending === this.concurrency) return;

        if (this.jobs.length) {
            const job = this.jobs.shift();

            this.pending++;
            job(this[kDone]);
        }
    }
}

var limiter = Limiter$1;

const zlib = require$$0__default$1["default"];

const bufferUtil = bufferUtil$1.exports;
const Limiter = limiter;
const { kStatusCode: kStatusCode$2 } = constants;

const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
const kPerMessageDeflate = Symbol('permessage-deflate');
const kTotalLength = Symbol('total-length');
const kCallback = Symbol('callback');
const kBuffers = Symbol('buffers');
const kError$1 = Symbol('error');

//
// We limit zlib concurrency, which prevents severe memory fragmentation
// as documented in https://github.com/nodejs/node/issues/8871#issuecomment-250915913
// and https://github.com/websockets/ws/issues/1202
//
// Intentionally global; it's the global thread pool that's an issue.
//
let zlibLimiter;

/**
 * permessage-deflate implementation.
 */
class PerMessageDeflate$3 {
    /**
     * Creates a PerMessageDeflate instance.
     *
     * @param {Object} [options] Configuration options
     * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
     *     for, or request, a custom client window size
     * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
     *     acknowledge disabling of client context takeover
     * @param {Number} [options.concurrencyLimit=10] The number of concurrent
     *     calls to zlib
     * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
     *     use of a custom server window size
     * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
     *     disabling of server context takeover
     * @param {Number} [options.threshold=1024] Size (in bytes) below which
     *     messages should not be compressed if context takeover is disabled
     * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
     *     deflate
     * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
     *     inflate
     * @param {Boolean} [isServer=false] Create the instance in either server or
     *     client mode
     * @param {Number} [maxPayload=0] The maximum allowed message length
     */
    constructor(options, isServer, maxPayload) {
        this._maxPayload = maxPayload | 0;
        this._options = options || {};
        this._threshold =
            this._options.threshold !== undefined ? this._options.threshold : 1024;
        this._isServer = !!isServer;
        this._deflate = null;
        this._inflate = null;

        this.params = null;

        if (!zlibLimiter) {
            const concurrency =
                this._options.concurrencyLimit !== undefined ?
                this._options.concurrencyLimit :
                10;
            zlibLimiter = new Limiter(concurrency);
        }
    }

    /**
     * @type {String}
     */
    static get extensionName() {
        return 'permessage-deflate';
    }

    /**
     * Create an extension negotiation offer.
     *
     * @return {Object} Extension parameters
     * @public
     */
    offer() {
        const params = {};

        if (this._options.serverNoContextTakeover) {
            params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
            params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
            params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
            params.client_max_window_bits = true;
        }

        return params;
    }

    /**
     * Accept an extension negotiation offer/response.
     *
     * @param {Array} configurations The extension negotiation offers/reponse
     * @return {Object} Accepted configuration
     * @public
     */
    accept(configurations) {
        configurations = this.normalizeParams(configurations);

        this.params = this._isServer ?
            this.acceptAsServer(configurations) :
            this.acceptAsClient(configurations);

        return this.params;
    }

    /**
     * Releases all resources used by the extension.
     *
     * @public
     */
    cleanup() {
        if (this._inflate) {
            this._inflate.close();
            this._inflate = null;
        }

        if (this._deflate) {
            const callback = this._deflate[kCallback];

            this._deflate.close();
            this._deflate = null;

            if (callback) {
                callback(
                    new Error(
                        'The deflate stream was closed while data was being processed'
                    )
                );
            }
        }
    }

    /**
     *  Accept an extension negotiation offer.
     *
     * @param {Array} offers The extension negotiation offers
     * @return {Object} Accepted configuration
     * @private
     */
    acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
            if (
                (opts.serverNoContextTakeover === false &&
                    params.server_no_context_takeover) ||
                (params.server_max_window_bits &&
                    (opts.serverMaxWindowBits === false ||
                        (typeof opts.serverMaxWindowBits === 'number' &&
                            opts.serverMaxWindowBits > params.server_max_window_bits))) ||
                (typeof opts.clientMaxWindowBits === 'number' &&
                    !params.client_max_window_bits)
            ) {
                return false;
            }

            return true;
        });

        if (!accepted) {
            throw new Error('None of the extension offers can be accepted');
        }

        if (opts.serverNoContextTakeover) {
            accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
            accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === 'number') {
            accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === 'number') {
            accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (
            accepted.client_max_window_bits === true ||
            opts.clientMaxWindowBits === false
        ) {
            delete accepted.client_max_window_bits;
        }

        return accepted;
    }

    /**
     * Accept the extension negotiation response.
     *
     * @param {Array} response The extension negotiation response
     * @return {Object} Accepted configuration
     * @private
     */
    acceptAsClient(response) {
        const params = response[0];

        if (
            this._options.clientNoContextTakeover === false &&
            params.client_no_context_takeover
        ) {
            throw new Error('Unexpected parameter "client_no_context_takeover"');
        }

        if (!params.client_max_window_bits) {
            if (typeof this._options.clientMaxWindowBits === 'number') {
                params.client_max_window_bits = this._options.clientMaxWindowBits;
            }
        } else if (
            this._options.clientMaxWindowBits === false ||
            (typeof this._options.clientMaxWindowBits === 'number' &&
                params.client_max_window_bits > this._options.clientMaxWindowBits)
        ) {
            throw new Error(
                'Unexpected or invalid parameter "client_max_window_bits"'
            );
        }

        return params;
    }

    /**
     * Normalize parameters.
     *
     * @param {Array} configurations The extension negotiation offers/reponse
     * @return {Array} The offers/response with normalized parameters
     * @private
     */
    normalizeParams(configurations) {
        configurations.forEach((params) => {
            Object.keys(params).forEach((key) => {
                let value = params[key];

                if (value.length > 1) {
                    throw new Error(`Parameter "${key}" must have only a single value`);
                }

                value = value[0];

                if (key === 'client_max_window_bits') {
                    if (value !== true) {
                        const num = +value;
                        if (!Number.isInteger(num) || num < 8 || num > 15) {
                            throw new TypeError(
                                `Invalid value for parameter "${key}": ${value}`
                            );
                        }
                        value = num;
                    } else if (!this._isServer) {
                        throw new TypeError(
                            `Invalid value for parameter "${key}": ${value}`
                        );
                    }
                } else if (key === 'server_max_window_bits') {
                    const num = +value;
                    if (!Number.isInteger(num) || num < 8 || num > 15) {
                        throw new TypeError(
                            `Invalid value for parameter "${key}": ${value}`
                        );
                    }
                    value = num;
                } else if (
                    key === 'client_no_context_takeover' ||
                    key === 'server_no_context_takeover'
                ) {
                    if (value !== true) {
                        throw new TypeError(
                            `Invalid value for parameter "${key}": ${value}`
                        );
                    }
                } else {
                    throw new Error(`Unknown parameter "${key}"`);
                }

                params[key] = value;
            });
        });

        return configurations;
    }

    /**
     * Decompress data. Concurrency limited.
     *
     * @param {Buffer} data Compressed data
     * @param {Boolean} fin Specifies whether or not this is the last fragment
     * @param {Function} callback Callback
     * @public
     */
    decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
            this._decompress(data, fin, (err, result) => {
                done();
                callback(err, result);
            });
        });
    }

    /**
     * Compress data. Concurrency limited.
     *
     * @param {(Buffer|String)} data Data to compress
     * @param {Boolean} fin Specifies whether or not this is the last fragment
     * @param {Function} callback Callback
     * @public
     */
    compress(data, fin, callback) {
        zlibLimiter.add((done) => {
            this._compress(data, fin, (err, result) => {
                done();
                callback(err, result);
            });
        });
    }

    /**
     * Decompress data.
     *
     * @param {Buffer} data Compressed data
     * @param {Boolean} fin Specifies whether or not this is the last fragment
     * @param {Function} callback Callback
     * @private
     */
    _decompress(data, fin, callback) {
        const endpoint = this._isServer ? 'client' : 'server';

        if (!this._inflate) {
            const key = `${endpoint}_max_window_bits`;
            const windowBits =
                typeof this.params[key] !== 'number' ?
                zlib.Z_DEFAULT_WINDOWBITS :
                this.params[key];

            this._inflate = zlib.createInflateRaw({
                ...this._options.zlibInflateOptions,
                windowBits
            });
            this._inflate[kPerMessageDeflate] = this;
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            this._inflate.on('error', inflateOnError);
            this._inflate.on('data', inflateOnData);
        }

        this._inflate[kCallback] = callback;

        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);

        this._inflate.flush(() => {
            const err = this._inflate[kError$1];

            if (err) {
                this._inflate.close();
                this._inflate = null;
                callback(err);
                return;
            }

            const data = bufferUtil.concat(
                this._inflate[kBuffers],
                this._inflate[kTotalLength]
            );

            if (this._inflate._readableState.endEmitted) {
                this._inflate.close();
                this._inflate = null;
            } else {
                this._inflate[kTotalLength] = 0;
                this._inflate[kBuffers] = [];

                if (fin && this.params[`${endpoint}_no_context_takeover`]) {
                    this._inflate.reset();
                }
            }

            callback(null, data);
        });
    }

    /**
     * Compress data.
     *
     * @param {(Buffer|String)} data Data to compress
     * @param {Boolean} fin Specifies whether or not this is the last fragment
     * @param {Function} callback Callback
     * @private
     */
    _compress(data, fin, callback) {
        const endpoint = this._isServer ? 'server' : 'client';

        if (!this._deflate) {
            const key = `${endpoint}_max_window_bits`;
            const windowBits =
                typeof this.params[key] !== 'number' ?
                zlib.Z_DEFAULT_WINDOWBITS :
                this.params[key];

            this._deflate = zlib.createDeflateRaw({
                ...this._options.zlibDeflateOptions,
                windowBits
            });

            this._deflate[kTotalLength] = 0;
            this._deflate[kBuffers] = [];

            this._deflate.on('data', deflateOnData);
        }

        this._deflate[kCallback] = callback;

        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
            if (!this._deflate) {
                //
                // The deflate stream was closed while data was being processed.
                //
                return;
            }

            let data = bufferUtil.concat(
                this._deflate[kBuffers],
                this._deflate[kTotalLength]
            );

            if (fin) data = data.slice(0, data.length - 4);

            //
            // Ensure that the callback will not be called again in
            // `PerMessageDeflate#cleanup()`.
            //
            this._deflate[kCallback] = null;

            this._deflate[kTotalLength] = 0;
            this._deflate[kBuffers] = [];

            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
                this._deflate.reset();
            }

            callback(null, data);
        });
    }
}

var permessageDeflate = PerMessageDeflate$3;

/**
 * The listener of the `zlib.DeflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function deflateOnData(chunk) {
    this[kBuffers].push(chunk);
    this[kTotalLength] += chunk.length;
}

/**
 * The listener of the `zlib.InflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function inflateOnData(chunk) {
    this[kTotalLength] += chunk.length;

    if (
        this[kPerMessageDeflate]._maxPayload < 1 ||
        this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload
    ) {
        this[kBuffers].push(chunk);
        return;
    }

    this[kError$1] = new RangeError('Max payload size exceeded');
    this[kError$1].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
    this[kError$1][kStatusCode$2] = 1009;
    this.removeListener('data', inflateOnData);
    this.reset();
}

/**
 * The listener of the `zlib.InflateRaw` stream `'error'` event.
 *
 * @param {Error} err The emitted error
 * @private
 */
function inflateOnError(err) {
    //
    // There is no need to call `Zlib#close()` as the handle is automatically
    // closed when an error is emitted.
    //
    this[kPerMessageDeflate]._inflate = null;
    err[kStatusCode$2] = 1007;
    this[kCallback](err);
}

var validation = { exports: {} };

var isValidUTF8_1;

//
// Allowed token characters:
//
// '!', '#', '$', '%', '&', ''', '*', '+', '-',
// '.', 0-9, A-Z, '^', '_', '`', a-z, '|', '~'
//
// tokenChars[32] === 0 // ' '
// tokenChars[33] === 1 // '!'
// tokenChars[34] === 0 // '"'
// ...
//
// prettier-ignore
const tokenChars$1 = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
    0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, // 32 - 47
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, // 80 - 95
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 // 112 - 127
];

/**
 * Checks if a status code is allowed in a close frame.
 *
 * @param {Number} code The status code
 * @return {Boolean} `true` if the status code is valid, else `false`
 * @public
 */
function isValidStatusCode$2(code) {
    return (
        (code >= 1000 &&
            code <= 1014 &&
            code !== 1004 &&
            code !== 1005 &&
            code !== 1006) ||
        (code >= 3000 && code <= 4999)
    );
}

/**
 * Checks if a given buffer contains only correct UTF-8.
 * Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
 * Markus Kuhn.
 *
 * @param {Buffer} buf The buffer to check
 * @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
 * @public
 */
function _isValidUTF8(buf) {
    const len = buf.length;
    let i = 0;

    while (i < len) {
        if ((buf[i] & 0x80) === 0) {
            // 0xxxxxxx
            i++;
        } else if ((buf[i] & 0xe0) === 0xc0) {
            // 110xxxxx 10xxxxxx
            if (
                i + 1 === len ||
                (buf[i + 1] & 0xc0) !== 0x80 ||
                (buf[i] & 0xfe) === 0xc0 // Overlong
            ) {
                return false;
            }

            i += 2;
        } else if ((buf[i] & 0xf0) === 0xe0) {
            // 1110xxxx 10xxxxxx 10xxxxxx
            if (
                i + 2 >= len ||
                (buf[i + 1] & 0xc0) !== 0x80 ||
                (buf[i + 2] & 0xc0) !== 0x80 ||
                (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) || // Overlong
                (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) // Surrogate (U+D800 - U+DFFF)
            ) {
                return false;
            }

            i += 3;
        } else if ((buf[i] & 0xf8) === 0xf0) {
            // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
            if (
                i + 3 >= len ||
                (buf[i + 1] & 0xc0) !== 0x80 ||
                (buf[i + 2] & 0xc0) !== 0x80 ||
                (buf[i + 3] & 0xc0) !== 0x80 ||
                (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) || // Overlong
                (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
                buf[i] > 0xf4 // > U+10FFFF
            ) {
                return false;
            }

            i += 4;
        } else {
            return false;
        }
    }

    return true;
}

validation.exports = {
    isValidStatusCode: isValidStatusCode$2,
    isValidUTF8: _isValidUTF8,
    tokenChars: tokenChars$1
};

/* istanbul ignore else  */
if (!process.env.WS_NO_UTF_8_VALIDATE) {
    try {
        const isValidUTF8 = require('utf-8-validate');

        isValidUTF8_1 = validation.exports.isValidUTF8 = function(buf) {
            return buf.length < 150 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
    } catch (e) {
        // Continue regardless of the error.
    }
}

const { Writable } = require$$0__default$2["default"];

const PerMessageDeflate$2 = permessageDeflate;
const {
    BINARY_TYPES: BINARY_TYPES$1,
    EMPTY_BUFFER: EMPTY_BUFFER$2,
    kStatusCode: kStatusCode$1,
    kWebSocket: kWebSocket$1
} = constants;
const { concat, toArrayBuffer, unmask } = bufferUtil$1.exports;
const { isValidStatusCode: isValidStatusCode$1, isValidUTF8 } = validation.exports;

const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;

/**
 * HyBi Receiver implementation.
 *
 * @extends Writable
 */
class Receiver$1 extends Writable {
    /**
     * Creates a Receiver instance.
     *
     * @param {Object} [options] Options object
     * @param {String} [options.binaryType=nodebuffer] The type for binary data
     * @param {Object} [options.extensions] An object containing the negotiated
     *     extensions
     * @param {Boolean} [options.isServer=false] Specifies whether to operate in
     *     client or server mode
     * @param {Number} [options.maxPayload=0] The maximum allowed message length
     * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
     *     not to skip UTF-8 validation for text and close messages
     */
    constructor(options = {}) {
        super();

        this._binaryType = options.binaryType || BINARY_TYPES$1[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket$1] = undefined;

        this._bufferedBytes = 0;
        this._buffers = [];

        this._compressed = false;
        this._payloadLength = 0;
        this._mask = undefined;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;

        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];

        this._state = GET_INFO;
        this._loop = false;
    }

    /**
     * Implements `Writable.prototype._write()`.
     *
     * @param {Buffer} chunk The chunk of data to write
     * @param {String} encoding The character encoding of `chunk`
     * @param {Function} cb Callback
     * @private
     */
    _write(chunk, encoding, cb) {
        if (this._opcode === 0x08 && this._state == GET_INFO) return cb();

        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
    }

    /**
     * Consumes `n` bytes from the buffered data.
     *
     * @param {Number} n The number of bytes to consume
     * @return {Buffer} The consumed bytes
     * @private
     */
    consume(n) {
        this._bufferedBytes -= n;

        if (n === this._buffers[0].length) return this._buffers.shift();

        if (n < this._buffers[0].length) {
            const buf = this._buffers[0];
            this._buffers[0] = buf.slice(n);
            return buf.slice(0, n);
        }

        const dst = Buffer.allocUnsafe(n);

        do {
            const buf = this._buffers[0];
            const offset = dst.length - n;

            if (n >= buf.length) {
                dst.set(this._buffers.shift(), offset);
            } else {
                dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
                this._buffers[0] = buf.slice(n);
            }

            n -= buf.length;
        } while (n > 0);

        return dst;
    }

    /**
     * Starts the parsing loop.
     *
     * @param {Function} cb Callback
     * @private
     */
    startLoop(cb) {
        let err;
        this._loop = true;

        do {
            switch (this._state) {
                case GET_INFO:
                    err = this.getInfo();
                    break;
                case GET_PAYLOAD_LENGTH_16:
                    err = this.getPayloadLength16();
                    break;
                case GET_PAYLOAD_LENGTH_64:
                    err = this.getPayloadLength64();
                    break;
                case GET_MASK:
                    this.getMask();
                    break;
                case GET_DATA:
                    err = this.getData(cb);
                    break;
                default:
                    // `INFLATING`
                    this._loop = false;
                    return;
            }
        } while (this._loop);

        cb(err);
    }

    /**
     * Reads the first two bytes of a frame.
     *
     * @return {(RangeError|undefined)} A possible error
     * @private
     */
    getInfo() {
        if (this._bufferedBytes < 2) {
            this._loop = false;
            return;
        }

        const buf = this.consume(2);

        if ((buf[0] & 0x30) !== 0x00) {
            this._loop = false;
            return error(
                RangeError,
                'RSV2 and RSV3 must be clear',
                true,
                1002,
                'WS_ERR_UNEXPECTED_RSV_2_3'
            );
        }

        const compressed = (buf[0] & 0x40) === 0x40;

        if (compressed && !this._extensions[PerMessageDeflate$2.extensionName]) {
            this._loop = false;
            return error(
                RangeError,
                'RSV1 must be clear',
                true,
                1002,
                'WS_ERR_UNEXPECTED_RSV_1'
            );
        }

        this._fin = (buf[0] & 0x80) === 0x80;
        this._opcode = buf[0] & 0x0f;
        this._payloadLength = buf[1] & 0x7f;

        if (this._opcode === 0x00) {
            if (compressed) {
                this._loop = false;
                return error(
                    RangeError,
                    'RSV1 must be clear',
                    true,
                    1002,
                    'WS_ERR_UNEXPECTED_RSV_1'
                );
            }

            if (!this._fragmented) {
                this._loop = false;
                return error(
                    RangeError,
                    'invalid opcode 0',
                    true,
                    1002,
                    'WS_ERR_INVALID_OPCODE'
                );
            }

            this._opcode = this._fragmented;
        } else if (this._opcode === 0x01 || this._opcode === 0x02) {
            if (this._fragmented) {
                this._loop = false;
                return error(
                    RangeError,
                    `invalid opcode ${this._opcode}`,
                    true,
                    1002,
                    'WS_ERR_INVALID_OPCODE'
                );
            }

            this._compressed = compressed;
        } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
            if (!this._fin) {
                this._loop = false;
                return error(
                    RangeError,
                    'FIN must be set',
                    true,
                    1002,
                    'WS_ERR_EXPECTED_FIN'
                );
            }

            if (compressed) {
                this._loop = false;
                return error(
                    RangeError,
                    'RSV1 must be clear',
                    true,
                    1002,
                    'WS_ERR_UNEXPECTED_RSV_1'
                );
            }

            if (this._payloadLength > 0x7d) {
                this._loop = false;
                return error(
                    RangeError,
                    `invalid payload length ${this._payloadLength}`,
                    true,
                    1002,
                    'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
                );
            }
        } else {
            this._loop = false;
            return error(
                RangeError,
                `invalid opcode ${this._opcode}`,
                true,
                1002,
                'WS_ERR_INVALID_OPCODE'
            );
        }

        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 0x80) === 0x80;

        if (this._isServer) {
            if (!this._masked) {
                this._loop = false;
                return error(
                    RangeError,
                    'MASK must be set',
                    true,
                    1002,
                    'WS_ERR_EXPECTED_MASK'
                );
            }
        } else if (this._masked) {
            this._loop = false;
            return error(
                RangeError,
                'MASK must be clear',
                true,
                1002,
                'WS_ERR_UNEXPECTED_MASK'
            );
        }

        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else return this.haveLength();
    }

    /**
     * Gets extended payload length (7+16).
     *
     * @return {(RangeError|undefined)} A possible error
     * @private
     */
    getPayloadLength16() {
        if (this._bufferedBytes < 2) {
            this._loop = false;
            return;
        }

        this._payloadLength = this.consume(2).readUInt16BE(0);
        return this.haveLength();
    }

    /**
     * Gets extended payload length (7+64).
     *
     * @return {(RangeError|undefined)} A possible error
     * @private
     */
    getPayloadLength64() {
        if (this._bufferedBytes < 8) {
            this._loop = false;
            return;
        }

        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);

        //
        // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned
        // if payload length is greater than this number.
        //
        if (num > Math.pow(2, 53 - 32) - 1) {
            this._loop = false;
            return error(
                RangeError,
                'Unsupported WebSocket frame: payload length > 2^53 - 1',
                false,
                1009,
                'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'
            );
        }

        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        return this.haveLength();
    }

    /**
     * Payload length has been read.
     *
     * @return {(RangeError|undefined)} A possible error
     * @private
     */
    haveLength() {
        if (this._payloadLength && this._opcode < 0x08) {
            this._totalPayloadLength += this._payloadLength;
            if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
                this._loop = false;
                return error(
                    RangeError,
                    'Max payload size exceeded',
                    false,
                    1009,
                    'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
                );
            }
        }

        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
    }

    /**
     * Reads mask bytes.
     *
     * @private
     */
    getMask() {
        if (this._bufferedBytes < 4) {
            this._loop = false;
            return;
        }

        this._mask = this.consume(4);
        this._state = GET_DATA;
    }

    /**
     * Reads data bytes.
     *
     * @param {Function} cb Callback
     * @return {(Error|RangeError|undefined)} A possible error
     * @private
     */
    getData(cb) {
        let data = EMPTY_BUFFER$2;

        if (this._payloadLength) {
            if (this._bufferedBytes < this._payloadLength) {
                this._loop = false;
                return;
            }

            data = this.consume(this._payloadLength);

            if (
                this._masked &&
                (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0
            ) {
                unmask(data, this._mask);
            }
        }

        if (this._opcode > 0x07) return this.controlMessage(data);

        if (this._compressed) {
            this._state = INFLATING;
            this.decompress(data, cb);
            return;
        }

        if (data.length) {
            //
            // This message is not compressed so its length is the sum of the payload
            // length of all fragments.
            //
            this._messageLength = this._totalPayloadLength;
            this._fragments.push(data);
        }

        return this.dataMessage();
    }

    /**
     * Decompresses data.
     *
     * @param {Buffer} data Compressed data
     * @param {Function} cb Callback
     * @private
     */
    decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate$2.extensionName];

        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
            if (err) return cb(err);

            if (buf.length) {
                this._messageLength += buf.length;
                if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
                    return cb(
                        error(
                            RangeError,
                            'Max payload size exceeded',
                            false,
                            1009,
                            'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
                        )
                    );
                }

                this._fragments.push(buf);
            }

            const er = this.dataMessage();
            if (er) return cb(er);

            this.startLoop(cb);
        });
    }

    /**
     * Handles a data message.
     *
     * @return {(Error|undefined)} A possible error
     * @private
     */
    dataMessage() {
        if (this._fin) {
            const messageLength = this._messageLength;
            const fragments = this._fragments;

            this._totalPayloadLength = 0;
            this._messageLength = 0;
            this._fragmented = 0;
            this._fragments = [];

            if (this._opcode === 2) {
                let data;

                if (this._binaryType === 'nodebuffer') {
                    data = concat(fragments, messageLength);
                } else if (this._binaryType === 'arraybuffer') {
                    data = toArrayBuffer(concat(fragments, messageLength));
                } else {
                    data = fragments;
                }

                this.emit('message', data, true);
            } else {
                const buf = concat(fragments, messageLength);

                if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
                    this._loop = false;
                    return error(
                        Error,
                        'invalid UTF-8 sequence',
                        true,
                        1007,
                        'WS_ERR_INVALID_UTF8'
                    );
                }

                this.emit('message', buf, false);
            }
        }

        this._state = GET_INFO;
    }

    /**
     * Handles a control message.
     *
     * @param {Buffer} data Data to handle
     * @return {(Error|RangeError|undefined)} A possible error
     * @private
     */
    controlMessage(data) {
        if (this._opcode === 0x08) {
            this._loop = false;

            if (data.length === 0) {
                this.emit('conclude', 1005, EMPTY_BUFFER$2);
                this.end();
            } else if (data.length === 1) {
                return error(
                    RangeError,
                    'invalid payload length 1',
                    true,
                    1002,
                    'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
                );
            } else {
                const code = data.readUInt16BE(0);

                if (!isValidStatusCode$1(code)) {
                    return error(
                        RangeError,
                        `invalid status code ${code}`,
                        true,
                        1002,
                        'WS_ERR_INVALID_CLOSE_CODE'
                    );
                }

                const buf = data.slice(2);

                if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
                    return error(
                        Error,
                        'invalid UTF-8 sequence',
                        true,
                        1007,
                        'WS_ERR_INVALID_UTF8'
                    );
                }

                this.emit('conclude', code, buf);
                this.end();
            }
        } else if (this._opcode === 0x09) {
            this.emit('ping', data);
        } else {
            this.emit('pong', data);
        }

        this._state = GET_INFO;
    }
}

var receiver = Receiver$1;

/**
 * Builds an error object.
 *
 * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
 * @param {String} message The error message
 * @param {Boolean} prefix Specifies whether or not to add a default prefix to
 *     `message`
 * @param {Number} statusCode The status code
 * @param {String} errorCode The exposed error code
 * @return {(Error|RangeError)} The error
 * @private
 */
function error(ErrorCtor, message, prefix, statusCode, errorCode) {
    const err = new ErrorCtor(
        prefix ? `Invalid WebSocket frame: ${message}` : message
    );

    Error.captureStackTrace(err, error);
    err.code = errorCode;
    err[kStatusCode$1] = statusCode;
    return err;
}

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^net|tls$" }] */
const { randomFillSync } = require$$5__default["default"];

const PerMessageDeflate$1 = permessageDeflate;
const { EMPTY_BUFFER: EMPTY_BUFFER$1 } = constants;
const { isValidStatusCode } = validation.exports;
const { mask: applyMask, toBuffer: toBuffer$1 } = bufferUtil$1.exports;

const kByteLength = Symbol('kByteLength');
const maskBuffer = Buffer.alloc(4);

/**
 * HyBi Sender implementation.
 */
class Sender$1 {
    /**
     * Creates a Sender instance.
     *
     * @param {(net.Socket|tls.Socket)} socket The connection socket
     * @param {Object} [extensions] An object containing the negotiated extensions
     * @param {Function} [generateMask] The function used to generate the masking
     *     key
     */
    constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};

        if (generateMask) {
            this._generateMask = generateMask;
            this._maskBuffer = Buffer.alloc(4);
        }

        this._socket = socket;

        this._firstFragment = true;
        this._compress = false;

        this._bufferedBytes = 0;
        this._deflating = false;
        this._queue = [];
    }

    /**
     * Frames a piece of data according to the HyBi WebSocket protocol.
     *
     * @param {(Buffer|String)} data The data to frame
     * @param {Object} options Options object
     * @param {Boolean} [options.fin=false] Specifies whether or not to set the
     *     FIN bit
     * @param {Function} [options.generateMask] The function used to generate the
     *     masking key
     * @param {Boolean} [options.mask=false] Specifies whether or not to mask
     *     `data`
     * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
     *     key
     * @param {Number} options.opcode The opcode
     * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
     *     modified
     * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
     *     RSV1 bit
     * @return {(Buffer|String)[]} The framed data
     * @public
     */
    static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;

        if (options.mask) {
            mask = options.maskBuffer || maskBuffer;

            if (options.generateMask) {
                options.generateMask(mask);
            } else {
                randomFillSync(mask, 0, 4);
            }

            skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
            offset = 6;
        }

        let dataLength;

        if (typeof data === 'string') {
            if (
                (!options.mask || skipMasking) &&
                options[kByteLength] !== undefined
            ) {
                dataLength = options[kByteLength];
            } else {
                data = Buffer.from(data);
                dataLength = data.length;
            }
        } else {
            dataLength = data.length;
            merge = options.mask && options.readOnly && !skipMasking;
        }

        let payloadLength = dataLength;

        if (dataLength >= 65536) {
            offset += 8;
            payloadLength = 127;
        } else if (dataLength > 125) {
            offset += 2;
            payloadLength = 126;
        }

        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);

        target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
        if (options.rsv1) target[0] |= 0x40;

        target[1] = payloadLength;

        if (payloadLength === 126) {
            target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
            target[2] = target[3] = 0;
            target.writeUIntBE(dataLength, 4, 6);
        }

        if (!options.mask) return [target, data];

        target[1] |= 0x80;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];

        if (skipMasking) return [target, data];

        if (merge) {
            applyMask(data, mask, target, offset, dataLength);
            return [target];
        }

        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
    }

    /**
     * Sends a close message to the other peer.
     *
     * @param {Number} [code] The status code component of the body
     * @param {(String|Buffer)} [data] The message component of the body
     * @param {Boolean} [mask=false] Specifies whether or not to mask the message
     * @param {Function} [cb] Callback
     * @public
     */
    close(code, data, mask, cb) {
        let buf;

        if (code === undefined) {
            buf = EMPTY_BUFFER$1;
        } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
            throw new TypeError('First argument must be a valid error code number');
        } else if (data === undefined || !data.length) {
            buf = Buffer.allocUnsafe(2);
            buf.writeUInt16BE(code, 0);
        } else {
            const length = Buffer.byteLength(data);

            if (length > 123) {
                throw new RangeError('The message must not be greater than 123 bytes');
            }

            buf = Buffer.allocUnsafe(2 + length);
            buf.writeUInt16BE(code, 0);

            if (typeof data === 'string') {
                buf.write(data, 2);
            } else {
                buf.set(data, 2);
            }
        }

        const options = {
            [kByteLength]: buf.length,
            fin: true,
            generateMask: this._generateMask,
            mask,
            maskBuffer: this._maskBuffer,
            opcode: 0x08,
            readOnly: false,
            rsv1: false
        };

        if (this._deflating) {
            this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
            this.sendFrame(Sender$1.frame(buf, options), cb);
        }
    }

    /**
     * Sends a ping message to the other peer.
     *
     * @param {*} data The message to send
     * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
     * @param {Function} [cb] Callback
     * @public
     */
    ping(data, mask, cb) {
        let byteLength;
        let readOnly;

        if (typeof data === 'string') {
            byteLength = Buffer.byteLength(data);
            readOnly = false;
        } else {
            data = toBuffer$1(data);
            byteLength = data.length;
            readOnly = toBuffer$1.readOnly;
        }

        if (byteLength > 125) {
            throw new RangeError('The data size must not be greater than 125 bytes');
        }

        const options = {
            [kByteLength]: byteLength,
            fin: true,
            generateMask: this._generateMask,
            mask,
            maskBuffer: this._maskBuffer,
            opcode: 0x09,
            readOnly,
            rsv1: false
        };

        if (this._deflating) {
            this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
            this.sendFrame(Sender$1.frame(data, options), cb);
        }
    }

    /**
     * Sends a pong message to the other peer.
     *
     * @param {*} data The message to send
     * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
     * @param {Function} [cb] Callback
     * @public
     */
    pong(data, mask, cb) {
        let byteLength;
        let readOnly;

        if (typeof data === 'string') {
            byteLength = Buffer.byteLength(data);
            readOnly = false;
        } else {
            data = toBuffer$1(data);
            byteLength = data.length;
            readOnly = toBuffer$1.readOnly;
        }

        if (byteLength > 125) {
            throw new RangeError('The data size must not be greater than 125 bytes');
        }

        const options = {
            [kByteLength]: byteLength,
            fin: true,
            generateMask: this._generateMask,
            mask,
            maskBuffer: this._maskBuffer,
            opcode: 0x0a,
            readOnly,
            rsv1: false
        };

        if (this._deflating) {
            this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
            this.sendFrame(Sender$1.frame(data, options), cb);
        }
    }

    /**
     * Sends a data message to the other peer.
     *
     * @param {*} data The message to send
     * @param {Object} options Options object
     * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
     *     or text
     * @param {Boolean} [options.compress=false] Specifies whether or not to
     *     compress `data`
     * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
     *     last one
     * @param {Boolean} [options.mask=false] Specifies whether or not to mask
     *     `data`
     * @param {Function} [cb] Callback
     * @public
     */
    send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate$1.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;

        let byteLength;
        let readOnly;

        if (typeof data === 'string') {
            byteLength = Buffer.byteLength(data);
            readOnly = false;
        } else {
            data = toBuffer$1(data);
            byteLength = data.length;
            readOnly = toBuffer$1.readOnly;
        }

        if (this._firstFragment) {
            this._firstFragment = false;
            if (
                rsv1 &&
                perMessageDeflate &&
                perMessageDeflate.params[
                    perMessageDeflate._isServer ?
                    'server_no_context_takeover' :
                    'client_no_context_takeover'
                ]
            ) {
                rsv1 = byteLength >= perMessageDeflate._threshold;
            }
            this._compress = rsv1;
        } else {
            rsv1 = false;
            opcode = 0;
        }

        if (options.fin) this._firstFragment = true;

        if (perMessageDeflate) {
            const opts = {
                [kByteLength]: byteLength,
                fin: options.fin,
                generateMask: this._generateMask,
                mask: options.mask,
                maskBuffer: this._maskBuffer,
                opcode,
                readOnly,
                rsv1
            };

            if (this._deflating) {
                this.enqueue([this.dispatch, data, this._compress, opts, cb]);
            } else {
                this.dispatch(data, this._compress, opts, cb);
            }
        } else {
            this.sendFrame(
                Sender$1.frame(data, {
                    [kByteLength]: byteLength,
                    fin: options.fin,
                    generateMask: this._generateMask,
                    mask: options.mask,
                    maskBuffer: this._maskBuffer,
                    opcode,
                    readOnly,
                    rsv1: false
                }),
                cb
            );
        }
    }

    /**
     * Dispatches a message.
     *
     * @param {(Buffer|String)} data The message to send
     * @param {Boolean} [compress=false] Specifies whether or not to compress
     *     `data`
     * @param {Object} options Options object
     * @param {Boolean} [options.fin=false] Specifies whether or not to set the
     *     FIN bit
     * @param {Function} [options.generateMask] The function used to generate the
     *     masking key
     * @param {Boolean} [options.mask=false] Specifies whether or not to mask
     *     `data`
     * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
     *     key
     * @param {Number} options.opcode The opcode
     * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
     *     modified
     * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
     *     RSV1 bit
     * @param {Function} [cb] Callback
     * @private
     */
    dispatch(data, compress, options, cb) {
        if (!compress) {
            this.sendFrame(Sender$1.frame(data, options), cb);
            return;
        }

        const perMessageDeflate = this._extensions[PerMessageDeflate$1.extensionName];

        this._bufferedBytes += options[kByteLength];
        this._deflating = true;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
            if (this._socket.destroyed) {
                const err = new Error(
                    'The socket was closed while data was being compressed'
                );

                if (typeof cb === 'function') cb(err);

                for (let i = 0; i < this._queue.length; i++) {
                    const params = this._queue[i];
                    const callback = params[params.length - 1];

                    if (typeof callback === 'function') callback(err);
                }

                return;
            }

            this._bufferedBytes -= options[kByteLength];
            this._deflating = false;
            options.readOnly = false;
            this.sendFrame(Sender$1.frame(buf, options), cb);
            this.dequeue();
        });
    }

    /**
     * Executes queued send operations.
     *
     * @private
     */
    dequeue() {
        while (!this._deflating && this._queue.length) {
            const params = this._queue.shift();

            this._bufferedBytes -= params[3][kByteLength];
            Reflect.apply(params[0], this, params.slice(1));
        }
    }

    /**
     * Enqueues a send operation.
     *
     * @param {Array} params Send operation parameters.
     * @private
     */
    enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
    }

    /**
     * Sends a frame.
     *
     * @param {Buffer[]} list The frame to send
     * @param {Function} [cb] Callback
     * @private
     */
    sendFrame(list, cb) {
        if (list.length === 2) {
            this._socket.cork();
            this._socket.write(list[0]);
            this._socket.write(list[1], cb);
            this._socket.uncork();
        } else {
            this._socket.write(list[0], cb);
        }
    }
}

var sender = Sender$1;

const { kForOnEventAttribute: kForOnEventAttribute$1, kListener: kListener$1 } = constants;

const kCode = Symbol('kCode');
const kData = Symbol('kData');
const kError = Symbol('kError');
const kMessage = Symbol('kMessage');
const kReason = Symbol('kReason');
const kTarget = Symbol('kTarget');
const kType = Symbol('kType');
const kWasClean = Symbol('kWasClean');

/**
 * Class representing an event.
 */
class Event {
    /**
     * Create a new `Event`.
     *
     * @param {String} type The name of the event
     * @throws {TypeError} If the `type` argument is not specified
     */
    constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
    }

    /**
     * @type {*}
     */
    get target() {
        return this[kTarget];
    }

    /**
     * @type {String}
     */
    get type() {
        return this[kType];
    }
}

Object.defineProperty(Event.prototype, 'target', { enumerable: true });
Object.defineProperty(Event.prototype, 'type', { enumerable: true });

/**
 * Class representing a close event.
 *
 * @extends Event
 */
class CloseEvent extends Event {
    /**
     * Create a new `CloseEvent`.
     *
     * @param {String} type The name of the event
     * @param {Object} [options] A dictionary object that allows for setting
     *     attributes via object members of the same name
     * @param {Number} [options.code=0] The status code explaining why the
     *     connection was closed
     * @param {String} [options.reason=''] A human-readable string explaining why
     *     the connection was closed
     * @param {Boolean} [options.wasClean=false] Indicates whether or not the
     *     connection was cleanly closed
     */
    constructor(type, options = {}) {
        super(type);

        this[kCode] = options.code === undefined ? 0 : options.code;
        this[kReason] = options.reason === undefined ? '' : options.reason;
        this[kWasClean] = options.wasClean === undefined ? false : options.wasClean;
    }

    /**
     * @type {Number}
     */
    get code() {
        return this[kCode];
    }

    /**
     * @type {String}
     */
    get reason() {
        return this[kReason];
    }

    /**
     * @type {Boolean}
     */
    get wasClean() {
        return this[kWasClean];
    }
}

Object.defineProperty(CloseEvent.prototype, 'code', { enumerable: true });
Object.defineProperty(CloseEvent.prototype, 'reason', { enumerable: true });
Object.defineProperty(CloseEvent.prototype, 'wasClean', { enumerable: true });

/**
 * Class representing an error event.
 *
 * @extends Event
 */
class ErrorEvent extends Event {
    /**
     * Create a new `ErrorEvent`.
     *
     * @param {String} type The name of the event
     * @param {Object} [options] A dictionary object that allows for setting
     *     attributes via object members of the same name
     * @param {*} [options.error=null] The error that generated this event
     * @param {String} [options.message=''] The error message
     */
    constructor(type, options = {}) {
        super(type);

        this[kError] = options.error === undefined ? null : options.error;
        this[kMessage] = options.message === undefined ? '' : options.message;
    }

    /**
     * @type {*}
     */
    get error() {
        return this[kError];
    }

    /**
     * @type {String}
     */
    get message() {
        return this[kMessage];
    }
}

Object.defineProperty(ErrorEvent.prototype, 'error', { enumerable: true });
Object.defineProperty(ErrorEvent.prototype, 'message', { enumerable: true });

/**
 * Class representing a message event.
 *
 * @extends Event
 */
class MessageEvent extends Event {
    /**
     * Create a new `MessageEvent`.
     *
     * @param {String} type The name of the event
     * @param {Object} [options] A dictionary object that allows for setting
     *     attributes via object members of the same name
     * @param {*} [options.data=null] The message content
     */
    constructor(type, options = {}) {
        super(type);

        this[kData] = options.data === undefined ? null : options.data;
    }

    /**
     * @type {*}
     */
    get data() {
        return this[kData];
    }
}

Object.defineProperty(MessageEvent.prototype, 'data', { enumerable: true });

/**
 * This provides methods for emulating the `EventTarget` interface. It's not
 * meant to be used directly.
 *
 * @mixin
 */
const EventTarget = {
    /**
     * Register an event listener.
     *
     * @param {String} type A string representing the event type to listen for
     * @param {Function} listener The listener to add
     * @param {Object} [options] An options object specifies characteristics about
     *     the event listener
     * @param {Boolean} [options.once=false] A `Boolean` indicating that the
     *     listener should be invoked at most once after being added. If `true`,
     *     the listener would be automatically removed when invoked.
     * @public
     */
    addEventListener(type, listener, options = {}) {
        let wrapper;

        if (type === 'message') {
            wrapper = function onMessage(data, isBinary) {
                const event = new MessageEvent('message', {
                    data: isBinary ? data : data.toString()
                });

                event[kTarget] = this;
                listener.call(this, event);
            };
        } else if (type === 'close') {
            wrapper = function onClose(code, message) {
                const event = new CloseEvent('close', {
                    code,
                    reason: message.toString(),
                    wasClean: this._closeFrameReceived && this._closeFrameSent
                });

                event[kTarget] = this;
                listener.call(this, event);
            };
        } else if (type === 'error') {
            wrapper = function onError(error) {
                const event = new ErrorEvent('error', {
                    error,
                    message: error.message
                });

                event[kTarget] = this;
                listener.call(this, event);
            };
        } else if (type === 'open') {
            wrapper = function onOpen() {
                const event = new Event('open');

                event[kTarget] = this;
                listener.call(this, event);
            };
        } else {
            return;
        }

        wrapper[kForOnEventAttribute$1] = !!options[kForOnEventAttribute$1];
        wrapper[kListener$1] = listener;

        if (options.once) {
            this.once(type, wrapper);
        } else {
            this.on(type, wrapper);
        }
    },

    /**
     * Remove an event listener.
     *
     * @param {String} type A string representing the event type to remove
     * @param {Function} handler The listener to remove
     * @public
     */
    removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
            if (listener[kListener$1] === handler && !listener[kForOnEventAttribute$1]) {
                this.removeListener(type, listener);
                break;
            }
        }
    }
};

var eventTarget = {
    CloseEvent,
    ErrorEvent,
    Event,
    EventTarget,
    MessageEvent
};

const { tokenChars } = validation.exports;

/**
 * Adds an offer to the map of extension offers or a parameter to the map of
 * parameters.
 *
 * @param {Object} dest The map of extension offers or parameters
 * @param {String} name The extension or parameter name
 * @param {(Object|Boolean|String)} elem The extension parameters or the
 *     parameter value
 * @private
 */
function push(dest, name, elem) {
    if (dest[name] === undefined) dest[name] = [elem];
    else dest[name].push(elem);
}

/**
 * Parses the `Sec-WebSocket-Extensions` header into an object.
 *
 * @param {String} header The field value of the header
 * @return {Object} The parsed object
 * @public
 */
function parse$1(header) {
    const offers = Object.create(null);
    let params = Object.create(null);
    let mustUnescape = false;
    let isEscaping = false;
    let inQuotes = false;
    let extensionName;
    let paramName;
    let start = -1;
    let code = -1;
    let end = -1;
    let i = 0;

    for (; i < header.length; i++) {
        code = header.charCodeAt(i);

        if (extensionName === undefined) {
            if (end === -1 && tokenChars[code] === 1) {
                if (start === -1) start = i;
            } else if (
                i !== 0 &&
                (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
            ) {
                if (end === -1 && start !== -1) end = i;
            } else if (code === 0x3b /* ';' */ || code === 0x2c /* ',' */ ) {
                if (start === -1) {
                    throw new SyntaxError(`Unexpected character at index ${i}`);
                }

                if (end === -1) end = i;
                const name = header.slice(start, end);
                if (code === 0x2c) {
                    push(offers, name, params);
                    params = Object.create(null);
                } else {
                    extensionName = name;
                }

                start = end = -1;
            } else {
                throw new SyntaxError(`Unexpected character at index ${i}`);
            }
        } else if (paramName === undefined) {
            if (end === -1 && tokenChars[code] === 1) {
                if (start === -1) start = i;
            } else if (code === 0x20 || code === 0x09) {
                if (end === -1 && start !== -1) end = i;
            } else if (code === 0x3b || code === 0x2c) {
                if (start === -1) {
                    throw new SyntaxError(`Unexpected character at index ${i}`);
                }

                if (end === -1) end = i;
                push(params, header.slice(start, end), true);
                if (code === 0x2c) {
                    push(offers, extensionName, params);
                    params = Object.create(null);
                    extensionName = undefined;
                }

                start = end = -1;
            } else if (code === 0x3d /* '=' */ && start !== -1 && end === -1) {
                paramName = header.slice(start, i);
                start = end = -1;
            } else {
                throw new SyntaxError(`Unexpected character at index ${i}`);
            }
        } else {
            //
            // The value of a quoted-string after unescaping must conform to the
            // token ABNF, so only token characters are valid.
            // Ref: https://tools.ietf.org/html/rfc6455#section-9.1
            //
            if (isEscaping) {
                if (tokenChars[code] !== 1) {
                    throw new SyntaxError(`Unexpected character at index ${i}`);
                }
                if (start === -1) start = i;
                else if (!mustUnescape) mustUnescape = true;
                isEscaping = false;
            } else if (inQuotes) {
                if (tokenChars[code] === 1) {
                    if (start === -1) start = i;
                } else if (code === 0x22 /* '"' */ && start !== -1) {
                    inQuotes = false;
                    end = i;
                } else if (code === 0x5c /* '\' */ ) {
                    isEscaping = true;
                } else {
                    throw new SyntaxError(`Unexpected character at index ${i}`);
                }
            } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
                inQuotes = true;
            } else if (end === -1 && tokenChars[code] === 1) {
                if (start === -1) start = i;
            } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
                if (end === -1) end = i;
            } else if (code === 0x3b || code === 0x2c) {
                if (start === -1) {
                    throw new SyntaxError(`Unexpected character at index ${i}`);
                }

                if (end === -1) end = i;
                let value = header.slice(start, end);
                if (mustUnescape) {
                    value = value.replace(/\\/g, '');
                    mustUnescape = false;
                }
                push(params, paramName, value);
                if (code === 0x2c) {
                    push(offers, extensionName, params);
                    params = Object.create(null);
                    extensionName = undefined;
                }

                paramName = undefined;
                start = end = -1;
            } else {
                throw new SyntaxError(`Unexpected character at index ${i}`);
            }
        }
    }

    if (start === -1 || inQuotes || code === 0x20 || code === 0x09) {
        throw new SyntaxError('Unexpected end of input');
    }

    if (end === -1) end = i;
    const token = header.slice(start, end);
    if (extensionName === undefined) {
        push(offers, token, params);
    } else {
        if (paramName === undefined) {
            push(params, token, true);
        } else if (mustUnescape) {
            push(params, paramName, token.replace(/\\/g, ''));
        } else {
            push(params, paramName, token);
        }
        push(offers, extensionName, params);
    }

    return offers;
}

/**
 * Builds the `Sec-WebSocket-Extensions` header field value.
 *
 * @param {Object} extensions The map of extensions and parameters to format
 * @return {String} A string representing the given object
 * @public
 */
function format$1(extensions) {
    return Object.keys(extensions)
        .map((extension) => {
            let configurations = extensions[extension];
            if (!Array.isArray(configurations)) configurations = [configurations];
            return configurations
                .map((params) => {
                    return [extension]
                        .concat(
                            Object.keys(params).map((k) => {
                                let values = params[k];
                                if (!Array.isArray(values)) values = [values];
                                return values
                                    .map((v) => (v === true ? k : `${k}=${v}`))
                                    .join('; ');
                            })
                        )
                        .join('; ');
                })
                .join(', ');
        })
        .join(', ');
}

var extension = { format: format$1, parse: parse$1 };

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Readable$" }] */

const EventEmitter = require$$0__default$3["default"];
const https = require$$1__default["default"];
const http = require$$2__default$1["default"];
const net = require$$3__default["default"];
const tls = require$$4__default["default"];
const { randomBytes, createHash } = require$$5__default["default"];
const { URL } = require$$7__default["default"];

const PerMessageDeflate = permessageDeflate;
const Receiver = receiver;
const Sender = sender;
const {
    BINARY_TYPES,
    EMPTY_BUFFER,
    GUID,
    kForOnEventAttribute,
    kListener,
    kStatusCode,
    kWebSocket,
    NOOP
} = constants;
const {
    EventTarget: { addEventListener, removeEventListener }
} = eventTarget;
const { format, parse } = extension;
const { toBuffer } = bufferUtil$1.exports;

const closeTimeout = 30 * 1000;
const kAborted = Symbol('kAborted');
const protocolVersions = [8, 13];
const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
const subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;

/**
 * Class representing a WebSocket.
 *
 * @extends EventEmitter
 */
class WebSocket extends EventEmitter {
    /**
     * Create a new `WebSocket`.
     *
     * @param {(String|URL)} address The URL to which to connect
     * @param {(String|String[])} [protocols] The subprotocols
     * @param {Object} [options] Connection options
     */
    constructor(address, protocols, options) {
        super();

        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._extensions = {};
        this._paused = false;
        this._protocol = '';
        this._readyState = WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;

        if (address !== null) {
            this._bufferedAmount = 0;
            this._isServer = false;
            this._redirects = 0;

            if (protocols === undefined) {
                protocols = [];
            } else if (!Array.isArray(protocols)) {
                if (typeof protocols === 'object' && protocols !== null) {
                    options = protocols;
                    protocols = [];
                } else {
                    protocols = [protocols];
                }
            }

            initAsClient(this, address, protocols, options);
        } else {
            this._isServer = true;
        }
    }

    /**
     * This deviates from the WHATWG interface since ws doesn't support the
     * required default "blob" type (instead we define a custom "nodebuffer"
     * type).
     *
     * @type {String}
     */
    get binaryType() {
        return this._binaryType;
    }

    set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;

        this._binaryType = type;

        //
        // Allow to change `binaryType` on the fly.
        //
        if (this._receiver) this._receiver._binaryType = type;
    }

    /**
     * @type {Number}
     */
    get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;

        return this._socket._writableState.length + this._sender._bufferedBytes;
    }

    /**
     * @type {String}
     */
    get extensions() {
        return Object.keys(this._extensions).join();
    }

    /**
     * @type {Boolean}
     */
    get isPaused() {
        return this._paused;
    }

    /**
     * @type {Function}
     */
    /* istanbul ignore next */
    get onclose() {
        return null;
    }

    /**
     * @type {Function}
     */
    /* istanbul ignore next */
    get onerror() {
        return null;
    }

    /**
     * @type {Function}
     */
    /* istanbul ignore next */
    get onopen() {
        return null;
    }

    /**
     * @type {Function}
     */
    /* istanbul ignore next */
    get onmessage() {
        return null;
    }

    /**
     * @type {String}
     */
    get protocol() {
        return this._protocol;
    }

    /**
     * @type {Number}
     */
    get readyState() {
        return this._readyState;
    }

    /**
     * @type {String}
     */
    get url() {
        return this._url;
    }

    /**
     * Set up the socket and the internal resources.
     *
     * @param {(net.Socket|tls.Socket)} socket The network socket between the
     *     server and client
     * @param {Buffer} head The first packet of the upgraded stream
     * @param {Object} options Options object
     * @param {Function} [options.generateMask] The function used to generate the
     *     masking key
     * @param {Number} [options.maxPayload=0] The maximum allowed message size
     * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
     *     not to skip UTF-8 validation for text and close messages
     * @private
     */
    setSocket(socket, head, options) {
        const receiver = new Receiver({
            binaryType: this.binaryType,
            extensions: this._extensions,
            isServer: this._isServer,
            maxPayload: options.maxPayload,
            skipUTF8Validation: options.skipUTF8Validation
        });

        this._sender = new Sender(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._socket = socket;

        receiver[kWebSocket] = this;
        socket[kWebSocket] = this;

        receiver.on('conclude', receiverOnConclude);
        receiver.on('drain', receiverOnDrain);
        receiver.on('error', receiverOnError);
        receiver.on('message', receiverOnMessage);
        receiver.on('ping', receiverOnPing);
        receiver.on('pong', receiverOnPong);

        socket.setTimeout(0);
        socket.setNoDelay();

        if (head.length > 0) socket.unshift(head);

        socket.on('close', socketOnClose);
        socket.on('data', socketOnData);
        socket.on('end', socketOnEnd);
        socket.on('error', socketOnError);

        this._readyState = WebSocket.OPEN;
        this.emit('open');
    }

    /**
     * Emit the `'close'` event.
     *
     * @private
     */
    emitClose() {
        if (!this._socket) {
            this._readyState = WebSocket.CLOSED;
            this.emit('close', this._closeCode, this._closeMessage);
            return;
        }

        if (this._extensions[PerMessageDeflate.extensionName]) {
            this._extensions[PerMessageDeflate.extensionName].cleanup();
        }

        this._receiver.removeAllListeners();
        this._readyState = WebSocket.CLOSED;
        this.emit('close', this._closeCode, this._closeMessage);
    }

    /**
     * Start a closing handshake.
     *
     *          +----------+   +-----------+   +----------+
     *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
     *    |     +----------+   +-----------+   +----------+     |
     *          +----------+   +-----------+         |
     * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
     *          +----------+   +-----------+   |
     *    |           |                        |   +---+        |
     *                +------------------------+-->|fin| - - - -
     *    |         +---+                      |   +---+
     *     - - - - -|fin|<---------------------+
     *              +---+
     *
     * @param {Number} [code] Status code explaining why the connection is closing
     * @param {(String|Buffer)} [data] The reason why the connection is
     *     closing
     * @public
     */
    close(code, data) {
        if (this.readyState === WebSocket.CLOSED) return;
        if (this.readyState === WebSocket.CONNECTING) {
            const msg = 'WebSocket was closed before the connection was established';
            return abortHandshake(this, this._req, msg);
        }

        if (this.readyState === WebSocket.CLOSING) {
            if (
                this._closeFrameSent &&
                (this._closeFrameReceived || this._receiver._writableState.errorEmitted)
            ) {
                this._socket.end();
            }

            return;
        }

        this._readyState = WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
            //
            // This error is handled by the `'error'` listener on the socket. We only
            // want to know if the close frame has been sent here.
            //
            if (err) return;

            this._closeFrameSent = true;

            if (
                this._closeFrameReceived ||
                this._receiver._writableState.errorEmitted
            ) {
                this._socket.end();
            }
        });

        //
        // Specify a timeout for the closing handshake to complete.
        //
        this._closeTimer = setTimeout(
            this._socket.destroy.bind(this._socket),
            closeTimeout
        );
    }

    /**
     * Pause the socket.
     *
     * @public
     */
    pause() {
        if (
            this.readyState === WebSocket.CONNECTING ||
            this.readyState === WebSocket.CLOSED
        ) {
            return;
        }

        this._paused = true;
        this._socket.pause();
    }

    /**
     * Send a ping.
     *
     * @param {*} [data] The data to send
     * @param {Boolean} [mask] Indicates whether or not to mask `data`
     * @param {Function} [cb] Callback which is executed when the ping is sent
     * @public
     */
    ping(data, mask, cb) {
        if (this.readyState === WebSocket.CONNECTING) {
            throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
        }

        if (typeof data === 'function') {
            cb = data;
            data = mask = undefined;
        } else if (typeof mask === 'function') {
            cb = mask;
            mask = undefined;
        }

        if (typeof data === 'number') data = data.toString();

        if (this.readyState !== WebSocket.OPEN) {
            sendAfterClose(this, data, cb);
            return;
        }

        if (mask === undefined) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
    }

    /**
     * Send a pong.
     *
     * @param {*} [data] The data to send
     * @param {Boolean} [mask] Indicates whether or not to mask `data`
     * @param {Function} [cb] Callback which is executed when the pong is sent
     * @public
     */
    pong(data, mask, cb) {
        if (this.readyState === WebSocket.CONNECTING) {
            throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
        }

        if (typeof data === 'function') {
            cb = data;
            data = mask = undefined;
        } else if (typeof mask === 'function') {
            cb = mask;
            mask = undefined;
        }

        if (typeof data === 'number') data = data.toString();

        if (this.readyState !== WebSocket.OPEN) {
            sendAfterClose(this, data, cb);
            return;
        }

        if (mask === undefined) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
    }

    /**
     * Resume the socket.
     *
     * @public
     */
    resume() {
        if (
            this.readyState === WebSocket.CONNECTING ||
            this.readyState === WebSocket.CLOSED
        ) {
            return;
        }

        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
    }

    /**
     * Send a data message.
     *
     * @param {*} data The message to send
     * @param {Object} [options] Options object
     * @param {Boolean} [options.binary] Specifies whether `data` is binary or
     *     text
     * @param {Boolean} [options.compress] Specifies whether or not to compress
     *     `data`
     * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
     *     last one
     * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
     * @param {Function} [cb] Callback which is executed when data is written out
     * @public
     */
    send(data, options, cb) {
        if (this.readyState === WebSocket.CONNECTING) {
            throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
        }

        if (typeof options === 'function') {
            cb = options;
            options = {};
        }

        if (typeof data === 'number') data = data.toString();

        if (this.readyState !== WebSocket.OPEN) {
            sendAfterClose(this, data, cb);
            return;
        }

        const opts = {
            binary: typeof data !== 'string',
            mask: !this._isServer,
            compress: true,
            fin: true,
            ...options
        };

        if (!this._extensions[PerMessageDeflate.extensionName]) {
            opts.compress = false;
        }

        this._sender.send(data || EMPTY_BUFFER, opts, cb);
    }

    /**
     * Forcibly close the connection.
     *
     * @public
     */
    terminate() {
        if (this.readyState === WebSocket.CLOSED) return;
        if (this.readyState === WebSocket.CONNECTING) {
            const msg = 'WebSocket was closed before the connection was established';
            return abortHandshake(this, this._req, msg);
        }

        if (this._socket) {
            this._readyState = WebSocket.CLOSING;
            this._socket.destroy();
        }
    }
}

/**
 * @constant {Number} CONNECTING
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'CONNECTING', {
    enumerable: true,
    value: readyStates.indexOf('CONNECTING')
});

/**
 * @constant {Number} CONNECTING
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'CONNECTING', {
    enumerable: true,
    value: readyStates.indexOf('CONNECTING')
});

/**
 * @constant {Number} OPEN
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'OPEN', {
    enumerable: true,
    value: readyStates.indexOf('OPEN')
});

/**
 * @constant {Number} OPEN
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'OPEN', {
    enumerable: true,
    value: readyStates.indexOf('OPEN')
});

/**
 * @constant {Number} CLOSING
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'CLOSING', {
    enumerable: true,
    value: readyStates.indexOf('CLOSING')
});

/**
 * @constant {Number} CLOSING
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'CLOSING', {
    enumerable: true,
    value: readyStates.indexOf('CLOSING')
});

/**
 * @constant {Number} CLOSED
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'CLOSED', {
    enumerable: true,
    value: readyStates.indexOf('CLOSED')
});

/**
 * @constant {Number} CLOSED
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'CLOSED', {
    enumerable: true,
    value: readyStates.indexOf('CLOSED')
});

[
    'binaryType',
    'bufferedAmount',
    'extensions',
    'isPaused',
    'protocol',
    'readyState',
    'url'
].forEach((property) => {
    Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
});

//
// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
//
['open', 'error', 'close', 'message'].forEach((method) => {
    Object.defineProperty(WebSocket.prototype, `on${method}`, {
        enumerable: true,
        get() {
            for (const listener of this.listeners(method)) {
                if (listener[kForOnEventAttribute]) return listener[kListener];
            }

            return null;
        },
        set(handler) {
            for (const listener of this.listeners(method)) {
                if (listener[kForOnEventAttribute]) {
                    this.removeListener(method, listener);
                    break;
                }
            }

            if (typeof handler !== 'function') return;

            this.addEventListener(method, handler, {
                [kForOnEventAttribute]: true
            });
        }
    });
});

WebSocket.prototype.addEventListener = addEventListener;
WebSocket.prototype.removeEventListener = removeEventListener;

var websocket = WebSocket;

/**
 * Initialize a WebSocket client.
 *
 * @param {WebSocket} websocket The client to initialize
 * @param {(String|URL)} address The URL to which to connect
 * @param {Array} protocols The subprotocols
 * @param {Object} [options] Connection options
 * @param {Boolean} [options.followRedirects=false] Whether or not to follow
 *     redirects
 * @param {Function} [options.generateMask] The function used to generate the
 *     masking key
 * @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
 *     handshake request
 * @param {Number} [options.maxPayload=104857600] The maximum allowed message
 *     size
 * @param {Number} [options.maxRedirects=10] The maximum number of redirects
 *     allowed
 * @param {String} [options.origin] Value of the `Origin` or
 *     `Sec-WebSocket-Origin` header
 * @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
 *     permessage-deflate
 * @param {Number} [options.protocolVersion=13] Value of the
 *     `Sec-WebSocket-Version` header
 * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
 *     not to skip UTF-8 validation for text and close messages
 * @private
 */
function initAsClient(websocket, address, protocols, options) {
    const opts = {
        protocolVersion: protocolVersions[1],
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        createConnection: undefined,
        socketPath: undefined,
        hostname: undefined,
        protocol: undefined,
        timeout: undefined,
        method: 'GET',
        host: undefined,
        path: undefined,
        port: undefined
    };

    if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
            `Unsupported protocol version: ${opts.protocolVersion} ` +
            `(supported versions: ${protocolVersions.join(', ')})`
        );
    }

    let parsedUrl;

    if (address instanceof URL) {
        parsedUrl = address;
        websocket._url = address.href;
    } else {
        try {
            parsedUrl = new URL(address);
        } catch (e) {
            throw new SyntaxError(`Invalid URL: ${address}`);
        }

        websocket._url = address;
    }

    const isSecure = parsedUrl.protocol === 'wss:';
    const isUnixSocket = parsedUrl.protocol === 'ws+unix:';
    let invalidURLMessage;

    if (parsedUrl.protocol !== 'ws:' && !isSecure && !isUnixSocket) {
        invalidURLMessage =
            'The URL\'s protocol must be one of "ws:", "wss:", or "ws+unix:"';
    } else if (isUnixSocket && !parsedUrl.pathname) {
        invalidURLMessage = "The URL's pathname is empty";
    } else if (parsedUrl.hash) {
        invalidURLMessage = 'The URL contains a fragment identifier';
    }

    if (invalidURLMessage) {
        const err = new SyntaxError(invalidURLMessage);

        if (websocket._redirects === 0) {
            throw err;
        } else {
            emitErrorAndClose(websocket, err);
            return;
        }
    }

    const defaultPort = isSecure ? 443 : 80;
    const key = randomBytes(16).toString('base64');
    const request = isSecure ? https.request : http.request;
    const protocolSet = new Set();
    let perMessageDeflate;

    opts.createConnection = isSecure ? tlsConnect : netConnect;
    opts.defaultPort = opts.defaultPort || defaultPort;
    opts.port = parsedUrl.port || defaultPort;
    opts.host = parsedUrl.hostname.startsWith('[') ?
        parsedUrl.hostname.slice(1, -1) :
        parsedUrl.hostname;
    opts.headers = {
        ...opts.headers,
        'Sec-WebSocket-Version': opts.protocolVersion,
        'Sec-WebSocket-Key': key,
        Connection: 'Upgrade',
        Upgrade: 'websocket'
    };
    opts.path = parsedUrl.pathname + parsedUrl.search;
    opts.timeout = opts.handshakeTimeout;

    if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate(
            opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
            false,
            opts.maxPayload
        );
        opts.headers['Sec-WebSocket-Extensions'] = format({
            [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
        });
    }
    if (protocols.length) {
        for (const protocol of protocols) {
            if (
                typeof protocol !== 'string' ||
                !subprotocolRegex.test(protocol) ||
                protocolSet.has(protocol)
            ) {
                throw new SyntaxError(
                    'An invalid or duplicated subprotocol was specified'
                );
            }

            protocolSet.add(protocol);
        }

        opts.headers['Sec-WebSocket-Protocol'] = protocols.join(',');
    }
    if (opts.origin) {
        if (opts.protocolVersion < 13) {
            opts.headers['Sec-WebSocket-Origin'] = opts.origin;
        } else {
            opts.headers.Origin = opts.origin;
        }
    }
    if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
    }

    if (isUnixSocket) {
        const parts = opts.path.split(':');

        opts.socketPath = parts[0];
        opts.path = parts[1];
    }

    let req;

    if (opts.followRedirects) {
        if (websocket._redirects === 0) {
            websocket._originalUnixSocket = isUnixSocket;
            websocket._originalSecure = isSecure;
            websocket._originalHostOrSocketPath = isUnixSocket ?
                opts.socketPath :
                parsedUrl.host;

            const headers = options && options.headers;

            //
            // Shallow copy the user provided options so that headers can be changed
            // without mutating the original object.
            //
            options = {...options, headers: {} };

            if (headers) {
                for (const [key, value] of Object.entries(headers)) {
                    options.headers[key.toLowerCase()] = value;
                }
            }
        } else if (websocket.listenerCount('redirect') === 0) {
            const isSameHost = isUnixSocket ?
                websocket._originalUnixSocket ?
                opts.socketPath === websocket._originalHostOrSocketPath :
                false :
                websocket._originalUnixSocket ?
                false :
                parsedUrl.host === websocket._originalHostOrSocketPath;

            if (!isSameHost || (websocket._originalSecure && !isSecure)) {
                //
                // Match curl 7.77.0 behavior and drop the following headers. These
                // headers are also dropped when following a redirect to a subdomain.
                //
                delete opts.headers.authorization;
                delete opts.headers.cookie;

                if (!isSameHost) delete opts.headers.host;

                opts.auth = undefined;
            }
        }

        //
        // Match curl 7.77.0 behavior and make the first `Authorization` header win.
        // If the `Authorization` header is set, then there is nothing to do as it
        // will take precedence.
        //
        if (opts.auth && !options.headers.authorization) {
            options.headers.authorization =
                'Basic ' + Buffer.from(opts.auth).toString('base64');
        }

        req = websocket._req = request(opts);

        if (websocket._redirects) {
            //
            // Unlike what is done for the `'upgrade'` event, no early exit is
            // triggered here if the user calls `websocket.close()` or
            // `websocket.terminate()` from a listener of the `'redirect'` event. This
            // is because the user can also call `request.destroy()` with an error
            // before calling `websocket.close()` or `websocket.terminate()` and this
            // would result in an error being emitted on the `request` object with no
            // `'error'` event listeners attached.
            //
            websocket.emit('redirect', websocket.url, req);
        }
    } else {
        req = websocket._req = request(opts);
    }

    if (opts.timeout) {
        req.on('timeout', () => {
            abortHandshake(websocket, req, 'Opening handshake has timed out');
        });
    }

    req.on('error', (err) => {
        if (req === null || req[kAborted]) return;

        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
    });

    req.on('response', (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;

        if (
            location &&
            opts.followRedirects &&
            statusCode >= 300 &&
            statusCode < 400
        ) {
            if (++websocket._redirects > opts.maxRedirects) {
                abortHandshake(websocket, req, 'Maximum redirects exceeded');
                return;
            }

            req.abort();

            let addr;

            try {
                addr = new URL(location, address);
            } catch (e) {
                const err = new SyntaxError(`Invalid URL: ${location}`);
                emitErrorAndClose(websocket, err);
                return;
            }

            initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit('unexpected-response', req, res)) {
            abortHandshake(
                websocket,
                req,
                `Unexpected server response: ${res.statusCode}`
            );
        }
    });

    req.on('upgrade', (res, socket, head) => {
        websocket.emit('upgrade', res);

        //
        // The user may have closed the connection from a listener of the
        // `'upgrade'` event.
        //
        if (websocket.readyState !== WebSocket.CONNECTING) return;

        req = websocket._req = null;

        if (res.headers.upgrade.toLowerCase() !== 'websocket') {
            abortHandshake(websocket, socket, 'Invalid Upgrade header');
            return;
        }

        const digest = createHash('sha1')
            .update(key + GUID)
            .digest('base64');

        if (res.headers['sec-websocket-accept'] !== digest) {
            abortHandshake(websocket, socket, 'Invalid Sec-WebSocket-Accept header');
            return;
        }

        const serverProt = res.headers['sec-websocket-protocol'];
        let protError;

        if (serverProt !== undefined) {
            if (!protocolSet.size) {
                protError = 'Server sent a subprotocol but none was requested';
            } else if (!protocolSet.has(serverProt)) {
                protError = 'Server sent an invalid subprotocol';
            }
        } else if (protocolSet.size) {
            protError = 'Server sent no subprotocol';
        }

        if (protError) {
            abortHandshake(websocket, socket, protError);
            return;
        }

        if (serverProt) websocket._protocol = serverProt;

        const secWebSocketExtensions = res.headers['sec-websocket-extensions'];

        if (secWebSocketExtensions !== undefined) {
            if (!perMessageDeflate) {
                const message =
                    'Server sent a Sec-WebSocket-Extensions header but no extension ' +
                    'was requested';
                abortHandshake(websocket, socket, message);
                return;
            }

            let extensions;

            try {
                extensions = parse(secWebSocketExtensions);
            } catch (err) {
                const message = 'Invalid Sec-WebSocket-Extensions header';
                abortHandshake(websocket, socket, message);
                return;
            }

            const extensionNames = Object.keys(extensions);

            if (
                extensionNames.length !== 1 ||
                extensionNames[0] !== PerMessageDeflate.extensionName
            ) {
                const message = 'Server indicated an extension that was not requested';
                abortHandshake(websocket, socket, message);
                return;
            }

            try {
                perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
            } catch (err) {
                const message = 'Invalid Sec-WebSocket-Extensions header';
                abortHandshake(websocket, socket, message);
                return;
            }

            websocket._extensions[PerMessageDeflate.extensionName] =
                perMessageDeflate;
        }

        websocket.setSocket(socket, head, {
            generateMask: opts.generateMask,
            maxPayload: opts.maxPayload,
            skipUTF8Validation: opts.skipUTF8Validation
        });
    });

    req.end();
}

/**
 * Emit the `'error'` and `'close'` events.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {Error} The error to emit
 * @private
 */
function emitErrorAndClose(websocket, err) {
    websocket._readyState = WebSocket.CLOSING;
    websocket.emit('error', err);
    websocket.emitClose();
}

/**
 * Create a `net.Socket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {net.Socket} The newly created socket used to start the connection
 * @private
 */
function netConnect(options) {
    options.path = options.socketPath;
    return net.connect(options);
}

/**
 * Create a `tls.TLSSocket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {tls.TLSSocket} The newly created socket used to start the connection
 * @private
 */
function tlsConnect(options) {
    options.path = undefined;

    if (!options.servername && options.servername !== '') {
        options.servername = net.isIP(options.host) ? '' : options.host;
    }

    return tls.connect(options);
}

/**
 * Abort the handshake and emit an error.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to
 *     abort or the socket to destroy
 * @param {String} message The error message
 * @private
 */
function abortHandshake(websocket, stream, message) {
    websocket._readyState = WebSocket.CLOSING;

    const err = new Error(message);
    Error.captureStackTrace(err, abortHandshake);

    if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();

        if (stream.socket && !stream.socket.destroyed) {
            //
            // On Node.js >= 14.3.0 `request.abort()` does not destroy the socket if
            // called after the request completed. See
            // https://github.com/websockets/ws/issues/1869.
            //
            stream.socket.destroy();
        }

        process.nextTick(emitErrorAndClose, websocket, err);
    } else {
        stream.destroy(err);
        stream.once('error', websocket.emit.bind(websocket, 'error'));
        stream.once('close', websocket.emitClose.bind(websocket));
    }
}

/**
 * Handle cases where the `ping()`, `pong()`, or `send()` methods are called
 * when the `readyState` attribute is `CLOSING` or `CLOSED`.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {*} [data] The data to send
 * @param {Function} [cb] Callback
 * @private
 */
function sendAfterClose(websocket, data, cb) {
    if (data) {
        const length = toBuffer(data).length;

        //
        // The `_bufferedAmount` property is used only when the peer is a client and
        // the opening handshake fails. Under these circumstances, in fact, the
        // `setSocket()` method is not called, so the `_socket` and `_sender`
        // properties are set to `null`.
        //
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
    }

    if (cb) {
        const err = new Error(
            `WebSocket is not open: readyState ${websocket.readyState} ` +
            `(${readyStates[websocket.readyState]})`
        );
        cb(err);
    }
}

/**
 * The listener of the `Receiver` `'conclude'` event.
 *
 * @param {Number} code The status code
 * @param {Buffer} reason The reason for closing
 * @private
 */
function receiverOnConclude(code, reason) {
    const websocket = this[kWebSocket];

    websocket._closeFrameReceived = true;
    websocket._closeMessage = reason;
    websocket._closeCode = code;

    if (websocket._socket[kWebSocket] === undefined) return;

    websocket._socket.removeListener('data', socketOnData);
    process.nextTick(resume, websocket._socket);

    if (code === 1005) websocket.close();
    else websocket.close(code, reason);
}

/**
 * The listener of the `Receiver` `'drain'` event.
 *
 * @private
 */
function receiverOnDrain() {
    const websocket = this[kWebSocket];

    if (!websocket.isPaused) websocket._socket.resume();
}

/**
 * The listener of the `Receiver` `'error'` event.
 *
 * @param {(RangeError|Error)} err The emitted error
 * @private
 */
function receiverOnError(err) {
    const websocket = this[kWebSocket];

    if (websocket._socket[kWebSocket] !== undefined) {
        websocket._socket.removeListener('data', socketOnData);

        //
        // On Node.js < 14.0.0 the `'error'` event is emitted synchronously. See
        // https://github.com/websockets/ws/issues/1940.
        //
        process.nextTick(resume, websocket._socket);

        websocket.close(err[kStatusCode]);
    }

    websocket.emit('error', err);
}

/**
 * The listener of the `Receiver` `'finish'` event.
 *
 * @private
 */
function receiverOnFinish() {
    this[kWebSocket].emitClose();
}

/**
 * The listener of the `Receiver` `'message'` event.
 *
 * @param {Buffer|ArrayBuffer|Buffer[])} data The message
 * @param {Boolean} isBinary Specifies whether the message is binary or not
 * @private
 */
function receiverOnMessage(data, isBinary) {
    this[kWebSocket].emit('message', data, isBinary);
}

/**
 * The listener of the `Receiver` `'ping'` event.
 *
 * @param {Buffer} data The data included in the ping frame
 * @private
 */
function receiverOnPing(data) {
    const websocket = this[kWebSocket];

    websocket.pong(data, !websocket._isServer, NOOP);
    websocket.emit('ping', data);
}

/**
 * The listener of the `Receiver` `'pong'` event.
 *
 * @param {Buffer} data The data included in the pong frame
 * @private
 */
function receiverOnPong(data) {
    this[kWebSocket].emit('pong', data);
}

/**
 * Resume a readable stream
 *
 * @param {Readable} stream The readable stream
 * @private
 */
function resume(stream) {
    stream.resume();
}

/**
 * The listener of the `net.Socket` `'close'` event.
 *
 * @private
 */
function socketOnClose() {
    const websocket = this[kWebSocket];

    this.removeListener('close', socketOnClose);
    this.removeListener('data', socketOnData);
    this.removeListener('end', socketOnEnd);

    websocket._readyState = WebSocket.CLOSING;

    let chunk;

    //
    // The close frame might not have been received or the `'end'` event emitted,
    // for example, if the socket was destroyed due to an error. Ensure that the
    // `receiver` stream is closed after writing any remaining buffered data to
    // it. If the readable side of the socket is in flowing mode then there is no
    // buffered data as everything has been already written and `readable.read()`
    // will return `null`. If instead, the socket is paused, any possible buffered
    // data will be read as a single chunk.
    //
    if (!this._readableState.endEmitted &&
        !websocket._closeFrameReceived &&
        !websocket._receiver._writableState.errorEmitted &&
        (chunk = websocket._socket.read()) !== null
    ) {
        websocket._receiver.write(chunk);
    }

    websocket._receiver.end();

    this[kWebSocket] = undefined;

    clearTimeout(websocket._closeTimer);

    if (
        websocket._receiver._writableState.finished ||
        websocket._receiver._writableState.errorEmitted
    ) {
        websocket.emitClose();
    } else {
        websocket._receiver.on('error', receiverOnFinish);
        websocket._receiver.on('finish', receiverOnFinish);
    }
}

/**
 * The listener of the `net.Socket` `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function socketOnData(chunk) {
    if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
    }
}

/**
 * The listener of the `net.Socket` `'end'` event.
 *
 * @private
 */
function socketOnEnd() {
    const websocket = this[kWebSocket];

    websocket._readyState = WebSocket.CLOSING;
    websocket._receiver.end();
    this.end();
}

/**
 * The listener of the `net.Socket` `'error'` event.
 *
 * @private
 */
function socketOnError() {
    const websocket = this[kWebSocket];

    this.removeListener('error', socketOnError);
    this.on('error', NOOP);

    if (websocket) {
        websocket._readyState = WebSocket.CLOSING;
        this.destroy();
    }
}

var workerProtocol = {
    "version": 1,
    "buffers": {
        "encoder": {
            "bytes": 10000000
        },
        "decoder": {
            "bytes": 10000000
        }
    },
    "messages": [{
            "id": "task",
            "fields": [
                "job:json",
                "image:blob"
            ]
        },
        {
            "id": "estimate",
            "fields": [
                "toc:uint64"
            ]
        },
        {
            "id": "complete",
            "fields": [
                "image:blob"
            ]
        },
        {
            "id": "fail",
            "fields": [
                "reason:string"
            ]
        }
    ]
};

main.exports.config();

log.config({ name: 'worker', color: 'cyan' });
log.info(`*** hallucinate cloud worker v1.0 ***`);

if (!process.env.MASTER_URL) {
    log.error(`missing environment variable: MASTER_URL`);
    log.error(`cannot continue`);
    process.exit(1);
}

if (!process.env.TEMP_PATH) {
    log.error(`missing environment variable: TEMP_PATH`);
    log.error(`cannot continue`);
    process.exit(1);
}


const protobuf = new ProtocolBuffer(workerProtocol);
const tempPath = path__default["default"].resolve(process.env.TEMP_PATH);

log.info(`temp folder is at: ${tempPath}`);



async function estimate({ job }) {
    return Date.now() + 3000
}

async function compute({ job, image }) {
    let file = path__default["default"].join(tempPath, `${job.xid}.jpg`);

    require$$0__default["default"].writeFileSync(file, image);

    await new Promise(resolve => setTimeout(resolve, 3000));

    return image
}


function connect() {
    log.info(`connecting to ${process.env.MASTER_URL.split('?')[0]}`);

    let ws = new websocket(`${process.env.MASTER_URL}&name=${require$$2__default["default"].hostname()}`);
    let send = (type, payload) => ws.send(protobuf.encode(type, payload));

    ws.on('open', () => {
        log.info('connection accepted');

        ws.on('close', (code, reason) => {
            log.warn(`lost connection to master (code ${code})`);
            setTimeout(connect, 3000);
        });
    });

    ws.on('message', buffer => {
        let { type, payload } = protobuf.decode(buffer);
        ws.emit(type, payload);
    });

    ws.on('task', ({ job, image }) => {
        log.info(`new task:`, job);

        estimate({ job })
            .then(toc => send('estimate', { toc }));

        compute({ job, image })
            .then(image => send('complete', { image }))
            .catch(error => send('fail', { reason: error.message }));
    });

    ws.on('error', error => {
        log.warn(`connection error:`, error);
        setTimeout(connect, 3000);
    });
}


connect();