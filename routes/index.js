var express = require("express");
var multer = require("multer");
const path = require("path");
const mysql = require("mysql2");
const Joi = require("joi");
const db = require("../config/db");
const fs = require("fs");
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const secretKey = crypto.randomBytes(64).toString("hex");
const flash = require("connect-flash");
var router = express.Router();

// Set up connect-flash middleware
router.use(flash());

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Middleware to check if the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        console.log("User is not authenticated. Redirecting to /login.");
        res.redirect("/login");
    }
}

// Login Route
router.get("/login", (req, res) => {
    res.render("login.hbs", { message: req.flash("error") });
});

// Register Route
router.get("/register", (req, res) => {
    res.render("register.hbs");
});

// Passport Authentication for Login
router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    })
);

// Logout Route
router.get("/logout", ensureAuthenticated, (req, res) => {
    console.log("Logging out user:", req.user); // Log user information before logout
    req.logout((err) => {
        if (err) {
            console.error("Error during logout:", err);
            return next(err);
        }
        console.log("User logged out"); // Log after logout
        res.redirect("/login");
    });
});

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(
            __dirname,
            "..",
            "uploads",
            new Date().toISOString().split("T")[0]
        );

        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
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

const appointmentController = require("../controller/AppointmentController");
const distributorController = require("../controller/DistributorController");
const employeeController = require("../controller/employeeController");

// Joi validation schema
const appointmentFormSchema = Joi.object({
    appointmentType: Joi.string().required(),
    appointmentReason: Joi.string().required(),
    baseTown: Joi.string().required(),
    townPopulation: Joi.number().required(),
    townState: Joi.string().required(),
    townRegion: Joi.string().required(),
    townPincode: Joi.number().required(),
    firstApprover: Joi.string().required(),
    secondApprover: Joi.string().required(),
    thirdApprover: Joi.string().required(),
    sapCode: Joi.number().allow("").optional(),
    exitPartyId: Joi.number().allow("").optional(),
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
    proposedTwoWheelerCount: Joi.number().required(),
    proposedFourWheelerCount: Joi.number().required(),
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

router.get("/", ensureAuthenticated, function (req, res, next) {
    res.render("index", { title: "Express" });
});

router.get("/home", function (req, res, next) {
    res.render("home", { title: "Home" });
});

router.get("/dbAppointmentForm", ensureAuthenticated, appointmentController.dbAppointmentForm);

router.get("/distributors", ensureAuthenticated, distributorController.getDistributorList);

router.get("/approvallist", ensureAuthenticated, appointmentController.getApprovalList);

// API endpoint to get distributor details by party_id
router.get("/getDistributor/:sap_code", distributorController.getDistributorById);

// route to get approval details
router.post("/getApprovalList", ensureAuthenticated, appointmentController.getApprovalList);

//get Employee Details
router.get("/getEmployeeDetails/:employeeId", employeeController.getEmployeeDetails);

// Fetch pending appointments
router.get('/:emp_id/getPendingAppointments',appointmentController.getPendingAppointments);

// Fetch approved appointments
router.get('/:emp_id/getApprovedAppointments',appointmentController.getApprovedAppointments);

//Fetch rejected appointments
router.get('/:emp_id/getRejectedAppointments',appointmentController.getRejectedAppointments);

// Approve appointment
router.post('/approve-appointment/:appt_id/:emp_id', appointmentController.approveAppointment);

// Reject appointment
router.post('/reject-appointment/:id', appointmentController.rejectAppointment);

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
    ]),
    validateAppointmentForm,
    appointmentController.submitAppointmentForm
);

module.exports = router;
