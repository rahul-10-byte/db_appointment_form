const db = require("../config/db");
const path = require("path");
const Joi = require("joi");
const multer = require("multer");

const dbAppointmentController = {
    dbAppointmentForm: async (req, res) => {
        db.query(
            "SELECT * FROM party_master where status = 1",
            (err, partyDetails) => {
                if (err) throw err;
                res.render("new_db_appointment_form", {
                    title: "Appointment Form",
                    partyDetails,
                });
            }
        );
    },

    submitAppointmentForm: async (req, res) => {
        const {
            appointmentReason,
            baseTown,
            townPopulation,
            townState,
            townRegion,
            firstApprover,
            secondApprover,
            thirdApprover,
            sapSSCode,
            existingPartyName,
            existingPartyTown,
            existingPartyContact,
            existingPartyTurnover,
            exitReason,
            claimSettlementStatus,
            claimRegarding,
            claimAmount,
            settlementTimeline,
            distributionDuration,
            firmName,
            GSTNo,
            firmAddress,
            cityName,
            stateName,
            pinCode,
            warehouseSize,
            contactPersonName,
            mobileNo,
            emailId,
            areaCovered,
            partyType,
            partyTurnover,
            accountHolderName,
            bankName,
            branchName,
            accountNo,
            IFSCCode,
            companyName1,
            companyCategory1,
            outletCovered1,
            salesmanCount1,
            vehicleCount1,
            approxTurnover1,
            approxInvestment1,
            companyName2,
            companyCategory2,
            outletCovered2,
            salesmanCount2,
            vehicleCount2,
            approxTurnover2,
            approxInvestment2,
            proposedOutletCovered,
            routesCount,
            proposedSalesmanCount,
            proposedVehicleCount,
            expectedTurnover,
            stockNorms,
            invoiceFrequency,
            compAvailable,
            compCount,
            internetConnection,
            RSConnectCompatible,
        } = req.body;

        const files = req.files;

        console.log("files data: ", files);

        // Extract file paths
        const filePaths = {};
        for (const fileField in req.files) {
            filePaths[fileField] = path.resolve(req.files[fileField][0].path);
        }

        console.log("File paths:", filePaths);

        isValidGSTNo(GSTNo);

        function isValidGSTNo(str) {
            let regex = new RegExp(
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
            );

            if (str == null) {
                return res.status(400).json({
                    status: false,
                    message: "GST No. is required",
                });
            }

            if (regex.test(str) == true) {
                console.log("GST No. is valid");
            } else {
                console.log("GST No. is invalid");
                return res.status(400).json({
                    status: false,
                    message: "GST No. is invalid",
                });
            }
        }

        const appointmentData = {
            appointment_reason: appointmentReason,
            town: baseTown,
            population: townPopulation,
            state: townState,
            region: townRegion,
            first_level_approver: firstApprover,
            second_level_approver: secondApprover,
            third_level_approver: thirdApprover,
        };

        console.log("Appointment data:", appointmentData);

        db.query(
            "INSERT INTO db_appointment_master SET ?",
            appointmentData,
            (error, results) => {
                if (error) {
                    console.error("Error inserting appointment data:", error);
                    return res.status(500).send("Error submitting form");
                }

                const appointmentId = results.insertId;
                console.log(
                    "Inserted appointment data with ID:",
                    appointmentId
                );

                // Inserting party exit data
                const partyExitData = {
                    appointment_id: appointmentId,
                    party_id: existingPartyName,
                    current_turnover: existingPartyTurnover,
                    exit_reason: exitReason,
                    claim_settlement_status: claimSettlementStatus,
                    claim_regarding: claimRegarding,
                    claim_amount: claimAmount,
                    settlement_timeline: settlementTimeline,
                    noc_resignation_letter: filePaths.uploadNOC,
                    distribution_duration: distributionDuration,
                };

                if (appointmentData.appointment_reason === "Expansion") {
                    console.log(
                        "no need to insert party exit data, as it is expansion"
                    );
                } else {
                    insertExitData(partyExitData, res);
                }

                // Inserting new party data
                setStatus = 1;

                const partyData = {
                    status: setStatus,
                    firm_name: firmName,
                    address: firmAddress,
                    city: cityName,
                    state: stateName,
                    pincode: pinCode,
                    warehouse_size: warehouseSize,
                    firm_type: partyType,
                    gst_no: GSTNo,
                    current_turnover: partyTurnover,
                    contact_person: contactPersonName,
                    mobile: mobileNo,
                    email: emailId,
                    area_covered: areaCovered,
                    created_at: new Date(),
                };

                db.query(
                    "INSERT INTO party_master SET ?",
                    partyData,
                    (error, results) => {
                        if (error) {
                            console.error("Error inserting party data:", error);
                            return res
                                .status(500)
                                .send("Error submitting form");
                        }

                        const partyId = results.insertId;

                        // Inserting bank details
                        const bankData = {
                            party_id: partyId,
                            account_holder: accountHolderName,
                            bank_name: bankName,
                            branch_name: branchName,
                            account_no: accountNo,
                            ifsc_code: IFSCCode,
                        };

                        db.query(
                            "INSERT INTO party_bank_details SET ?",
                            bankData,
                            (error, results) => {
                                if (error) {
                                    console.error(
                                        "Error inserting bank data:",
                                        error
                                    );
                                    return res
                                        .status(500)
                                        .send("Error submitting form");
                                }
                                console.log(
                                    "Inserted bank data with ID:",
                                    results.insertId
                                );
                                // Inserting company details
                                const companyData1 = {
                                    party_id: partyId,
                                    company_name: companyName1,
                                    company_category: companyCategory1,
                                    outlets_covered: outletCovered1,
                                    salesman_count: salesmanCount1,
                                    vehicle_count: vehicleCount1,
                                    approx_turnover: approxTurnover1,
                                    approx_investment: approxInvestment1,
                                    invoice_proof: filePaths.investmentProof1,
                                };

                                // Check if the second form group data is provided
                                const isCompany2DataFilled =
                                    companyName2 ||
                                    companyCategory2 ||
                                    outletCovered2 ||
                                    salesmanCount2 ||
                                    vehicleCount2 ||
                                    approxTurnover2 ||
                                    approxInvestment2;

                                const companyData2 = isCompany2DataFilled
                                    ? {
                                          party_id: partyId,
                                          company_name: companyName2,
                                          company_category: companyCategory2,
                                          outlets_covered: outletCovered2,
                                          salesman_count: salesmanCount2,
                                          vehicle_count: vehicleCount2,
                                          approx_turnover: approxTurnover2,
                                          approx_investment: approxInvestment2,
                                          invoice_proof:
                                              filePaths.investmentProof2,
                                      }
                                    : null;

                                // Insert the first company data
                                db.query(
                                    "INSERT INTO party_existing_infrastructure SET ?",
                                    companyData1,
                                    (error, results) => {
                                        if (error) {
                                            console.error(
                                                "Error inserting companyData1:",
                                                error
                                            );
                                            return;
                                        }

                                        console.log(
                                            "Inserted companyData1:",
                                            results
                                        );

                                        console.log(
                                            "companyData2:",
                                            companyData2
                                        );

                                        // Insert the second company data if it is filled
                                        if (companyData2) {
                                            insertCompanyData(companyData2);
                                        }

                                        // Insert proposed infrastructure data
                                        const proposedInfrastructureData = {
                                            party_id: partyId,
                                            proposed_outlet_covered:
                                                proposedOutletCovered,
                                            routes_count: routesCount,
                                            proposed_salesman_count:
                                                proposedSalesmanCount,
                                            proposed_vehicle_count:
                                                proposedVehicleCount,
                                            expected_turnover: expectedTurnover,
                                            stock_norms: stockNorms,
                                            invoice_frequency: invoiceFrequency,
                                        };

                                        db.query(
                                            "INSERT INTO proposed_infrastructure SET ?",
                                            proposedInfrastructureData,
                                            (error, results) => {
                                                if (error) {
                                                    console.error(
                                                        "Error inserting proposed infrastructure data:",
                                                        error
                                                    );
                                                    return res
                                                        .status(500)
                                                        .send(
                                                            "Error submitting form"
                                                        );
                                                }
                                                console.log(
                                                    "Inserted proposed infrastructure data with ID:",
                                                    results.insertId
                                                );

                                                // Inserting system details
                                                const systemData = {
                                                    party_id: partyId,
                                                    computer_available:
                                                        compAvailable,
                                                    computer_count: compCount,
                                                    internet_connection:
                                                        internetConnection,
                                                    rs_connect_compatible:
                                                        RSConnectCompatible,
                                                };

                                                db.query(
                                                    "INSERT INTO party_it_infrastructure SET ?",
                                                    systemData,
                                                    (error, results) => {
                                                        if (error) {
                                                            console.error(
                                                                "Error inserting system data:",
                                                                error
                                                            );
                                                            return res
                                                                .status(500)
                                                                .send(
                                                                    "Error submitting form"
                                                                );
                                                        }
                                                        console.log(
                                                            "Inserted system data with ID:",
                                                            results.insertId
                                                        );

                                                        const documentsData = {
                                                            party_id: partyId,
                                                            owner_pic:
                                                                filePaths.ownerPic,
                                                            office_main_gate:
                                                                filePaths.officeGate,
                                                            godown_pic1:
                                                                filePaths.godownPic1,
                                                            godown_pic2:
                                                                filePaths.godownPic2,
                                                            delivery_veh_pic:
                                                                filePaths.deliveryVehPic,
                                                            delivery_veh_rc:
                                                                filePaths.deliveryVehRC,
                                                            gst_certificate:
                                                                filePaths.GSTCertficate,
                                                            firm_certificate:
                                                                filePaths.firmCertificate,
                                                            pan_card:
                                                                filePaths.partyPANCard,
                                                            aadhaar_card_front:
                                                                filePaths.partyAadhaarCardFront,
                                                            aadhaar_card_back:
                                                                filePaths.partyAadhaarCardBack,
                                                            cancelled_cheque:
                                                                filePaths.partyCancelledCheque,
                                                        };

                                                        db.query(
                                                            "INSERT INTO documents_master SET ?",
                                                            documentsData,
                                                            (
                                                                error,
                                                                results
                                                            ) => {
                                                                if (error) {
                                                                    console.error(
                                                                        "Error inserting documents data:",
                                                                        error
                                                                    );
                                                                    return res
                                                                        .status(
                                                                            500
                                                                        )
                                                                        .send(
                                                                            "Error submitting form"
                                                                        );
                                                                }
                                                                console.log(
                                                                    "Inserted documents data with ID:",
                                                                    results.insertId
                                                                );

                                                                // Inserting approval data
                                                                const approvalData =
                                                                    {
                                                                        appointment_id:
                                                                            appointmentId,
                                                                        approver_id:
                                                                            firstApprover,
                                                                        approval_status:
                                                                            "Pending",
                                                                        approval_level: 1,
                                                                    };

                                                                db.query(
                                                                    "INSERT INTO appointment_approvals SET ?",
                                                                    approvalData,
                                                                    (
                                                                        error,
                                                                        results
                                                                    ) => {
                                                                        if (
                                                                            error
                                                                        ) {
                                                                            console.error(
                                                                                "Error inserting approval data:",
                                                                                error
                                                                            );
                                                                            return res
                                                                                .status(
                                                                                    500
                                                                                )
                                                                                .send(
                                                                                    "Error submitting form"
                                                                                );
                                                                        }
                                                                        console.log(
                                                                            "Inserted approval data with ID:",
                                                                            results.insertId
                                                                        );

                                                                        res.status(
                                                                            200
                                                                        ).json(
                                                                            "Form submitted successfully!"
                                                                        );
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    },

    getApprovalList: async (req, res) => {
        db.query(
            `SELECT * FROM db_appointment_master where status = "pending"`,
            (err, appointmentDetails) => {
                if (err) throw err;
                res.render("approval_list", {
                    title: "Approval List",
                    appointmentDetails,
                });
            }
        );
    },
};

function insertExitData(partyExitData, res) {
    console.log("Inserting partyExitData:", partyExitData);

    db.query(
        "INSERT INTO party_exit_master SET ?",
        partyExitData,
        (error, results) => {
            if (error) {
                console.error("Error inserting party exit data:", error);
                return res.status(500).send("Error submitting form");
            }
            console.log("Inserted party exit data with ID:", results.insertId);

            //set inactive status for exit party master
            let setStatus = 0;

            db.query(
                "UPDATE party_master SET status = ? WHERE party_id = ?",
                [setStatus, existingPartyName],
                (error, results) => {
                    if (error) {
                        console.error("Error updating party status:", error);
                        return res.status(500).send("Error submitting form");
                    }
                    console.log(
                        "Updated party status as INACTIVE with ID:",
                        existingPartyName
                    );
                }
            );
        }
    );
}

function insertCompanyData(companyData) {
    // Insert the second company data if it is filled
    if (companyData) {
        console.log("Inserting companyData:", companyData);
        db.query(
            "INSERT INTO party_existing_infrastructure SET ?",
            companyData,
            (error, results) => {
                if (error) {
                    console.error("Error inserting companyData2:", error);
                    return;
                }

                console.log("Inserted companyData2:", results);
            }
        );
    }
}

module.exports = dbAppointmentController;
