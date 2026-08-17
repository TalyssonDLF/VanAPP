"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardiansService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var guardianSelect = { id: true, name: true, phone: true, email: true, document: true, createdAt: true, updatedAt: true };
var GuardiansService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var GuardiansService = _classThis = /** @class */ (function () {
        function GuardiansService_1(prisma) {
            this.prisma = prisma;
        }
        GuardiansService_1.prototype.conflict = function (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
                throw new common_1.ConflictException('Já existe um cadastro com este documento.');
            throw error;
        };
        GuardiansService_1.prototype.create = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.prisma.guardian.create({ data: { name: dto.name.trim(), phone: dto.phone, email: dto.email, document: dto.document }, select: guardianSelect })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_1 = _a.sent();
                            return [2 /*return*/, this.conflict(error_1)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        GuardiansService_1.prototype.list = function (query) {
            return __awaiter(this, void 0, void 0, function () {
                var search, where, _a, data, total;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            search = (_b = query.search) === null || _b === void 0 ? void 0 : _b.trim();
                            where = search ? { OR: [
                                    { name: { contains: search, mode: 'insensitive' } }, { phone: { contains: search.replace(/\D/g, '') } }, { email: { contains: search, mode: 'insensitive' } },
                                ] } : {};
                            return [4 /*yield*/, this.prisma.$transaction([
                                    this.prisma.guardian.findMany({ where: where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, orderBy: { name: 'asc' }, select: __assign(__assign({}, guardianSelect), { _count: { select: { students: true } } }) }),
                                    this.prisma.guardian.count({ where: where }),
                                ])];
                        case 1:
                            _a = _c.sent(), data = _a[0], total = _a[1];
                            return [2 /*return*/, { data: data.map(function (_a) {
                                        var _count = _a._count, guardian = __rest(_a, ["_count"]);
                                        return (__assign(__assign({}, guardian), { studentCount: _count.students }));
                                    }), pagination: { page: query.page, pageSize: query.pageSize, total: total, totalPages: Math.ceil(total / query.pageSize) } }];
                    }
                });
            });
        };
        GuardiansService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var guardian;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.guardian.findUnique({ where: { id: id }, select: __assign(__assign({}, guardianSelect), { students: { select: { relationship: true, student: { select: { id: true, name: true, status: true } } }, orderBy: { student: { name: 'asc' } } } }) })];
                        case 1:
                            guardian = _a.sent();
                            if (!guardian)
                                throw new common_1.NotFoundException('Responsável não encontrado.');
                            return [2 /*return*/, __assign(__assign({}, guardian), { students: guardian.students.map(function (_a) {
                                        var relationship = _a.relationship, student = _a.student;
                                        return (__assign(__assign({}, student), { relationship: relationship }));
                                    }) })];
                    }
                });
            });
        };
        GuardiansService_1.prototype.update = function (id, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.prisma.guardian.update({ where: { id: id }, data: __assign(__assign(__assign({}, (dto.name !== undefined && { name: dto.name.trim() })), (dto.phone !== undefined && { phone: dto.phone })), { email: dto.email, document: dto.document }), select: guardianSelect })];
                        case 3: return [2 /*return*/, _a.sent()];
                        case 4:
                            error_2 = _a.sent();
                            return [2 /*return*/, this.conflict(error_2)];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        GuardiansService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne(id)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.prisma.guardian.delete({ where: { id: id } })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { message: 'Responsável excluído.' }];
                }
            }); });
        };
        return GuardiansService_1;
    }());
    __setFunctionName(_classThis, "GuardiansService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GuardiansService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GuardiansService = _classThis;
}();
exports.GuardiansService = GuardiansService;
