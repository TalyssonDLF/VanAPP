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
exports.UpdateStudentDto = exports.CreateStudentDto = exports.StudentQueryDto = exports.StudentGuardianDto = void 0;
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var client_1 = require("@prisma/client");
var validation_1 = require("../../common/validation");
var StudentGuardianDto = function () {
    var _a;
    var _guardianId_decorators;
    var _guardianId_initializers = [];
    var _guardianId_extraInitializers = [];
    var _relationship_decorators;
    var _relationship_initializers = [];
    var _relationship_extraInitializers = [];
    return _a = /** @class */ (function () {
            function StudentGuardianDto() {
                this.guardianId = __runInitializers(this, _guardianId_initializers, void 0);
                this.relationship = (__runInitializers(this, _guardianId_extraInitializers), __runInitializers(this, _relationship_initializers, void 0));
                __runInitializers(this, _relationship_extraInitializers);
            }
            return StudentGuardianDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _guardianId_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1)];
            _relationship_decorators = [(0, class_validator_1.IsEnum)(client_1.GuardianRelationship)];
            __esDecorate(null, null, _guardianId_decorators, { kind: "field", name: "guardianId", static: false, private: false, access: { has: function (obj) { return "guardianId" in obj; }, get: function (obj) { return obj.guardianId; }, set: function (obj, value) { obj.guardianId = value; } }, metadata: _metadata }, _guardianId_initializers, _guardianId_extraInitializers);
            __esDecorate(null, null, _relationship_decorators, { kind: "field", name: "relationship", static: false, private: false, access: { has: function (obj) { return "relationship" in obj; }, get: function (obj) { return obj.relationship; }, set: function (obj, value) { obj.relationship = value; } }, metadata: _metadata }, _relationship_initializers, _relationship_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.StudentGuardianDto = StudentGuardianDto;
var StudentQueryDto = function () {
    var _a;
    var _classSuper = validation_1.PaginationDto;
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    return _a = /** @class */ (function (_super) {
            __extends(StudentQueryDto, _super);
            function StudentQueryDto() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.status = __runInitializers(_this, _status_initializers, void 0);
                __runInitializers(_this, _status_extraInitializers);
                return _this;
            }
            return StudentQueryDto;
        }(_classSuper)),
        (function () {
            var _b;
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _status_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(client_1.StudentStatus)];
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.StudentQueryDto = StudentQueryDto;
var CreateStudentDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _birthDate_decorators;
    var _birthDate_initializers = [];
    var _birthDate_extraInitializers = [];
    var _document_decorators;
    var _document_initializers = [];
    var _document_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _notes_decorators;
    var _notes_initializers = [];
    var _notes_extraInitializers = [];
    var _guardians_decorators;
    var _guardians_initializers = [];
    var _guardians_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateStudentDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.birthDate = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _birthDate_initializers, void 0));
                this.document = (__runInitializers(this, _birthDate_extraInitializers), __runInitializers(this, _document_initializers, void 0));
                this.status = (__runInitializers(this, _document_extraInitializers), __runInitializers(this, _status_initializers, client_1.StudentStatus.ACTIVE));
                this.notes = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                this.guardians = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _guardians_initializers, []));
                __runInitializers(this, _guardians_extraInitializers);
            }
            return CreateStudentDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2), (0, class_validator_1.MaxLength)(120)];
            _birthDate_decorators = [(0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (0, validation_1.emptyToUndefined)(value);
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)({ strict: true })];
            _document_decorators = [(0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (0, validation_1.digits)((0, validation_1.emptyToUndefined)(value));
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.Length)(11, 11), (0, validation_1.IsCpf)()];
            _status_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(client_1.StudentStatus)];
            _notes_decorators = [(0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (0, validation_1.emptyToUndefined)(value);
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(2000)];
            _guardians_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.ArrayUnique)(function (item) { return item.guardianId; }, { message: 'responsáveis não podem ser duplicados' }), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(function () { return StudentGuardianDto; })];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _birthDate_decorators, { kind: "field", name: "birthDate", static: false, private: false, access: { has: function (obj) { return "birthDate" in obj; }, get: function (obj) { return obj.birthDate; }, set: function (obj, value) { obj.birthDate = value; } }, metadata: _metadata }, _birthDate_initializers, _birthDate_extraInitializers);
            __esDecorate(null, null, _document_decorators, { kind: "field", name: "document", static: false, private: false, access: { has: function (obj) { return "document" in obj; }, get: function (obj) { return obj.document; }, set: function (obj, value) { obj.document = value; } }, metadata: _metadata }, _document_initializers, _document_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: function (obj) { return "notes" in obj; }, get: function (obj) { return obj.notes; }, set: function (obj, value) { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _guardians_decorators, { kind: "field", name: "guardians", static: false, private: false, access: { has: function (obj) { return "guardians" in obj; }, get: function (obj) { return obj.guardians; }, set: function (obj, value) { obj.guardians = value; } }, metadata: _metadata }, _guardians_initializers, _guardians_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateStudentDto = CreateStudentDto;
var UpdateStudentDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _birthDate_decorators;
    var _birthDate_initializers = [];
    var _birthDate_extraInitializers = [];
    var _document_decorators;
    var _document_initializers = [];
    var _document_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _notes_decorators;
    var _notes_initializers = [];
    var _notes_extraInitializers = [];
    var _guardians_decorators;
    var _guardians_initializers = [];
    var _guardians_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateStudentDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.birthDate = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _birthDate_initializers, void 0));
                this.document = (__runInitializers(this, _birthDate_extraInitializers), __runInitializers(this, _document_initializers, void 0));
                this.status = (__runInitializers(this, _document_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.notes = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
                this.guardians = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _guardians_initializers, void 0));
                __runInitializers(this, _guardians_extraInitializers);
            }
            return UpdateStudentDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(2), (0, class_validator_1.MaxLength)(120)];
            _birthDate_decorators = [(0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (0, validation_1.emptyToUndefined)(value);
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)({ strict: true })];
            _document_decorators = [(0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (0, validation_1.digits)((0, validation_1.emptyToUndefined)(value));
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.Length)(11, 11), (0, validation_1.IsCpf)()];
            _status_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(client_1.StudentStatus)];
            _notes_decorators = [(0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (0, validation_1.emptyToUndefined)(value);
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(2000)];
            _guardians_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.ArrayUnique)(function (item) { return item.guardianId; }, { message: 'responsáveis não podem ser duplicados' }), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(function () { return StudentGuardianDto; })];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _birthDate_decorators, { kind: "field", name: "birthDate", static: false, private: false, access: { has: function (obj) { return "birthDate" in obj; }, get: function (obj) { return obj.birthDate; }, set: function (obj, value) { obj.birthDate = value; } }, metadata: _metadata }, _birthDate_initializers, _birthDate_extraInitializers);
            __esDecorate(null, null, _document_decorators, { kind: "field", name: "document", static: false, private: false, access: { has: function (obj) { return "document" in obj; }, get: function (obj) { return obj.document; }, set: function (obj, value) { obj.document = value; } }, metadata: _metadata }, _document_initializers, _document_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: function (obj) { return "notes" in obj; }, get: function (obj) { return obj.notes; }, set: function (obj, value) { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _guardians_decorators, { kind: "field", name: "guardians", static: false, private: false, access: { has: function (obj) { return "guardians" in obj; }, get: function (obj) { return obj.guardians; }, set: function (obj, value) { obj.guardians = value; } }, metadata: _metadata }, _guardians_initializers, _guardians_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateStudentDto = UpdateStudentDto;
