"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.UpdateGuardianDto = exports.CreateGuardianDto = exports.GuardianQueryDto = void 0;
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var validation_1 = require("../../common/validation");
var GuardianQueryDto = /** @class */ (function (_super) {
    __extends(GuardianQueryDto, _super);
    function GuardianQueryDto() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return GuardianQueryDto;
}(validation_1.PaginationDto));
exports.GuardianQueryDto = GuardianQueryDto;
var CreateGuardianDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _phone_decorators;
    var _phone_initializers = [];
    var _phone_extraInitializers = [];
    var _email_decorators;
    var _email_initializers = [];
    var _email_extraInitializers = [];
    var _document_decorators;
    var _document_initializers = [];
    var _document_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateGuardianDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.phone = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
                this.email = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _email_initializers, void 0));
                this.document = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _document_initializers, void 0));
                __runInitializers(this, _document_extraInitializers);
            }
            return CreateGuardianDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2), (0, class_validator_1.MaxLength)(120)];
            _phone_decorators = [(0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (0, validation_1.digits)(value);
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.Matches)(/^\d{10,11}$/, { message: 'phone deve conter 10 ou 11 dígitos' })];
            _email_decorators = [(0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return typeof value === 'string' ? value.trim().toLowerCase() || undefined : (0, validation_1.emptyToUndefined)(value);
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEmail)(), (0, class_validator_1.MaxLength)(160)];
            _document_decorators = [(0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (0, validation_1.digits)((0, validation_1.emptyToUndefined)(value));
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.Length)(11, 11), (0, validation_1.IsCpf)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: function (obj) { return "phone" in obj; }, get: function (obj) { return obj.phone; }, set: function (obj, value) { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _document_decorators, { kind: "field", name: "document", static: false, private: false, access: { has: function (obj) { return "document" in obj; }, get: function (obj) { return obj.document; }, set: function (obj, value) { obj.document = value; } }, metadata: _metadata }, _document_initializers, _document_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateGuardianDto = CreateGuardianDto;
var UpdateGuardianDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _phone_decorators;
    var _phone_initializers = [];
    var _phone_extraInitializers = [];
    var _email_decorators;
    var _email_initializers = [];
    var _email_extraInitializers = [];
    var _document_decorators;
    var _document_initializers = [];
    var _document_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateGuardianDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.phone = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
                this.email = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _email_initializers, void 0));
                this.document = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _document_initializers, void 0));
                __runInitializers(this, _document_extraInitializers);
            }
            return UpdateGuardianDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2), (0, class_validator_1.MaxLength)(120)];
            _phone_decorators = [(0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (0, validation_1.digits)(value);
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.Matches)(/^\d{10,11}$/)];
            _email_decorators = [(0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return typeof value === 'string' ? value.trim().toLowerCase() || undefined : (0, validation_1.emptyToUndefined)(value);
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEmail)(), (0, class_validator_1.MaxLength)(160)];
            _document_decorators = [(0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (0, validation_1.digits)((0, validation_1.emptyToUndefined)(value));
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.Length)(11, 11), (0, validation_1.IsCpf)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: function (obj) { return "phone" in obj; }, get: function (obj) { return obj.phone; }, set: function (obj, value) { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
            __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
            __esDecorate(null, null, _document_decorators, { kind: "field", name: "document", static: false, private: false, access: { has: function (obj) { return "document" in obj; }, get: function (obj) { return obj.document; }, set: function (obj, value) { obj.document = value; } }, metadata: _metadata }, _document_initializers, _document_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateGuardianDto = UpdateGuardianDto;
