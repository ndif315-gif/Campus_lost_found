const express =
require("express");

const router =
express.Router();

const matchController =
require("../controllers/matchController");

router.get(
    "/run",
    async (req,res)=>{

        await matchController
        .findMatches();

        res.json({
            success:true,
            message:
            "Matching completed"
        });

    }
);

module.exports =
router;