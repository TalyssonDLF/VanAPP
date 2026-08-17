"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationDto = exports.emptyToUndefined = exports.digits = void 0;
exports.isCpf = isCpf;
exports.IsCpf = IsCpf;
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var digits = function (value) { return typeof value === 'string' ? value.replace(/\D/g, '') : value; };
exports.digits = digits;
var emptyToUndefined = function (value) { return value === '' || value === null ? undefined : value; };
exports.emptyToUndefined = emptyToUndefined;
function isCpf(value) {
    var cpf = value.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf))
        return false;
    var digit = function (length) {
        var sum = 0;
        for (var index = 0; index < length; index += 1)
            sum += Number(cpf[index]) * (length + 1 - index);
        var remainder = (sum * 10) % 11;
        return remainder === 10 ? 0 : remainder;
    };
    return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}
function IsCpf(options) {
    return function (object, propertyName) { return (0, class_validator_1.registerDecorator)({
        name: 'isCpf', target: object.constructor,
        propertyName: propertyName,
        options: options,
        validator: { validate: function (value) { return typeof value === 'string' && isCpf(value); }, defaultMessage: function (args) { return "".concat(args.property, " deve ser um CPF v\u00E1lido"); } },
    }); };
}
var PaginationDto = function () {
    var _a;
    var _search_decorators;
    var _search_initializers = [];
    var _search_extraInitializers = [];
    var _page_decorators;
    var _page_initializers = [];
    var _page_extraInitializers = [];
    var _pageSize_decorators;
    var _pageSize_initializers = [];
    var _pageSize_extraInitializers = [];
    return _a = /** @class */ (function () {
            function PaginationDto() {
                this.search = __runInitializers(this, _search_initializers, void 0);
                this.page = (__runInitializers(this, _search_extraInitializers), __runInitializers(this, _page_initializers, 1));
                this.pageSize = (__runInitializers(this, _page_extraInitializers), __runInitializers(this, _pageSize_initializers, 20));
                __runInitializers(this, _pageSize_extraInitializers);
            }
            return PaginationDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _search_decorators = [(0, class_validator_1.IsOptional)()];
            _page_decorators = [(0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return Number(value);
                }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(1)];
            _pageSize_decorators = [(0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return Number(value);
                }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(100)];
            __esDecorate(null, null, _search_decorators, { kind: "field", name: "search", static: false, private: false, access: { has: function (obj) { return "search" in obj; }, get: function (obj) { return obj.search; }, set: function (obj, value) { obj.search = value; } }, metadata: _metadata }, _search_initializers, _search_extraInitializers);
            __esDecorate(null, null, _page_decorators, { kind: "field", name: "page", static: false, private: false, access: { has: function (obj) { return "page" in obj; }, get: function (obj) { return obj.page; }, set: function (obj, value) { obj.page = value; } }, metadata: _metadata }, _page_initializers, _page_extraInitializers);
            __esDecorate(null, null, _pageSize_decorators, { kind: "field", name: "pageSize", static: false, private: false, access: { has: function (obj) { return "pageSize" in obj; }, get: function (obj) { return obj.pageSize; }, set: function (obj, value) { obj.pageSize = value; } }, metadata: _metadata }, _pageSize_initializers, _pageSize_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.PaginationDto = PaginationDto;
