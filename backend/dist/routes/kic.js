"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clubController_1 = require("../controllers/clubController");
const router = (0, express_1.Router)();
router.get('/', clubController_1.getKICs);
exports.default = router;
