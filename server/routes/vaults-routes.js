const express = require("express")
const { check } = require("express-validator")

const vaultsControllers = require("../controllers/vaults-controller")
const thesisControllers = require("../controllers/thesis-controller")
const checkAuth = require("../middleware/check-auth")

const router = express.Router()
router.use(checkAuth)

// GET ROUTES
router.get("/:vaultId", vaultsControllers.getVaultById)
router.get("/:vaultId/minimal", vaultsControllers.getMinimalVaultById)
router.get("/", vaultsControllers.getVaults)
router.get("/:vaultId/:thesisPointId", thesisControllers.getThesisPointById)

// POST ROUTES
router.post(
  "/",
  [check("vault_name").not().isEmpty()],
  vaultsControllers.createVault
)
router.post(
  "/:vaultId",
  [check("thesis_point_title").not().isEmpty()],
  thesisControllers.createThesisPoint
)
router.post("/:vaultId/upload", thesisControllers.uploadThesisPointAttachments)

// PATCH ROUTES
router.patch(
  "/:vaultId",
  [check("vault_name").not().isEmpty()],
  vaultsControllers.updateVault
)
router.patch(
  "/:vaultId/:thesisPointId",
  [check("thesis_point_title").not().isEmpty()],
  thesisControllers.updateThesisPoint
)

// DELETE ROUTES
router.delete("/:vaultId/upload", thesisControllers.deleteThesisPointAttachment)
router.delete(
  "/:vaultId/upload/discard",
  thesisControllers.discardThesisPointAttachments
)
router.delete("/:vaultId", vaultsControllers.deleteVault)
router.delete("/:vaultId/:thesisPointId", thesisControllers.deleteThesisPoint)
router.delete(
  "/:vaultId/:thesisPointId/edit",
  thesisControllers.deleteThesisPointExistingAttachment
)
module.exports = router
