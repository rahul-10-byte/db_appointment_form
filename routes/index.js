var express = require("express");
var multer = require("multer");
const path = require("path");
const mysql = require("mysql2");
const Joi = require("joi");
const db = require("../config/db");
const fs = require("fs");
var router = express.Router();

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log('Request body:', req.body);
    // const firmName = req.body.firmName;

    const dir = path.join(
      __dirname,
      "..",
      "uploads",
      new Date().toISOString().split("T")[0]
    );

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true,
      });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

const dbAppointmentController = require("../controller/dbAppointmentController");
const warehouseListController = require("../controller/warehouseListController");

// Joi validation schema
const appointmentFormSchema = Joi.object({
  appointmentReason: Joi.string().required(),
  baseTown: Joi.string().required(),
  townPopulation: Joi.number().required(),
  townState: Joi.string().required(),
  townRegion: Joi.string().required(),
  firstApprover: Joi.string().required(),
  secondApprover: Joi.string().required(),
  thirdApprover: Joi.string().required(),
  sapSSCode: Joi.number().allow("").optional(),
  existingPartyName: Joi.string().allow("").optional(),
  existingPartyTown: Joi.string().allow("").optional(),
  existingPartyContact: Joi.string().allow("").optional(),
  existingPartyTurnover: Joi.number().allow("").optional(),
  exitReason: Joi.string().allow("").optional(),
  claimSettlementStatus: Joi.string().allow("").optional(),
  claimRegarding: Joi.string().allow("").optional(),
  claimAmount: Joi.number().allow("").optional(),
  settlementTimeline: Joi.string().allow("").optional(),
  distributionDuration: Joi.string().allow("").optional(),
  firmName: Joi.string().required(),
  GSTNo: Joi.string().required(),
  firmAddress: Joi.string().required(),
  cityName: Joi.string().required(),
  stateName: Joi.string().required(),
  pinCode: Joi.string().required(),
  warehouseSize: Joi.string().required(),
  contactPersonName: Joi.string().required(),
  mobileNo: Joi.string().required(),
  emailId: Joi.string().email().required(),
  areaCovered: Joi.string().required(),
  partyType: Joi.string().required(),
  partyTurnover: Joi.number().required(),
  accountHolderName: Joi.string().required(),
  bankName: Joi.string().required(),
  branchName: Joi.string().required(),
  accountNo: Joi.string().required(),
  IFSCCode: Joi.string().required(),
  companyName1: Joi.string().optional(),
  companyCategory1: Joi.string().optional(),
  outletCovered1: Joi.string().optional(),
  salesmanCount1: Joi.number().optional(),
  vehicleCount1: Joi.number().optional(),
  approxTurnover1: Joi.number().optional(),
  approxInvestment1: Joi.number().optional(),
  companyName2: Joi.string().allow("").optional(),
  companyCategory2: Joi.string().allow("").optional(),
  outletCovered2: Joi.string().allow("").optional(),
  salesmanCount2: Joi.number().allow("").optional(),
  vehicleCount2: Joi.number().allow("").optional(),
  approxTurnover2: Joi.number().allow("").optional(),
  approxInvestment2: Joi.number().allow("").optional(),
  proposedOutletCovered: Joi.string().required(),
  routesCount: Joi.number().required(),
  proposedSalesmanCount: Joi.number().required(),
  proposedVehicleCount: Joi.number().required(),
  expectedTurnover: Joi.number().required(),
  stockNorms: Joi.string().required(),
  invoiceFrequency: Joi.string().required(),
  compAvailable: Joi.string().optional(),
  compCount: Joi.number().optional(),
  internetConnection: Joi.string().optional(),
  RSConnectCompatible: Joi.string().optional(),
});

// Validation middleware
const validateAppointmentForm = (req, res, next) => {
  const { error } = appointmentFormSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/home", function (req, res, next) {
  res.render("home", { title: "Home" });
});

router.get("/dbAppointmentForm", dbAppointmentController.dbAppointmentForm);

router.get("/warehouselist", warehouseListController.getWarehouseList);

// Route to handle form submission
router.post(
  "/submitAppointmentForm",
  upload.fields([
    { name: "uploadNOC", maxCount: 1 },
    { name: "GSTCertficate", maxCount: 1 },
    { name: "firmCertificate", maxCount: 1 },
    { name: "ownerPic", maxCount: 1 },
    { name: "officeGate", maxCount: 1 },
    { name: "godownPic1", maxCount: 1 },
    { name: "godownPic2", maxCount: 1 },
    { name: "partyPANCard", maxCount: 1 },
    { name: "partyAadhaarCardFront", maxCount: 1 },
    { name: "partyAadhaarCardBack", maxCount: 1 },
    { name: "partyCancelledCheque", maxCount: 1 },
    { name: "investmentProof1", maxCount: 1 },
    { name: "investmentProof2", maxCount: 1 },
    { name: "deliveryVehPic", maxCount: 1 },
    { name: "deliveryVehRC", maxCount: 1 },
  ]),
  validateAppointmentForm,
  dbAppointmentController.submitAppointmentForm
);

module.exports = router;
