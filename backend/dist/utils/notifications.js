"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
const Notification_1 = __importDefault(require("../models/Notification"));
async function createNotification(input) {
    return Notification_1.default.create(input);
}
