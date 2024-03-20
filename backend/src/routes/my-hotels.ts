import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import Hotel, { HotelType } from "../models/hotel";
import { verifyToken } from "../middleware/auth";
import { body } from "express-validator";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10mb
  },
});

// Api/my-hotels
router.post(
  "/",
  verifyToken,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type").notEmpty().withMessage("Type is required"),
    body("adultCount").notEmpty().withMessage("AdultCount is required"),
    body("childCount").notEmpty().withMessage("ChildCount is required"),
    body("facilities")
      .notEmpty()
      .isArray()
      .withMessage("Facilities is required"),
    body("pricePerNight")
      .notEmpty()
      .isNumeric()
      .withMessage("PricePerNight is required"),
    body("starRating").notEmpty().withMessage("StarRating is required"),
    body("imageUrls").notEmpty().withMessage("ImageUrls is required"),
    body("lastUpdated").notEmpty().withMessage("LastUpdated is required"),
  ],
  upload.array("imageFiles", 6),
  async (req: Request, res: Response) => {
    try {
      const imageFiles = req.files as Express.Multer.File[];
      const newHotel: HotelType = req.body;

      // 1. Upload the images to cloudinary
      const imageUrls = await uploadImages(imageFiles);

      newHotel.imageUrls = imageUrls;
      newHotel.lastUpdated = new Date();
      newHotel.userId = req.userId;

      // 3.Save the new hotel in our database
      const hotel = new Hotel(newHotel);
      await hotel.save();

      // 4.return a 201 status
      res.status(201).send(hotel);
    } catch (error) {
      console.log("Error creating hotel: ", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({ userId: req.userId });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  //Api/my-hotels/
  try {
    const id = req.params.id.toString();
    const hotel = await Hotel.findById({
      _id: id,
      userId: req.userId,
    });
    res.json(hotel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching hotels" });
  }
});

router.put(
  "/:hotelId",
  verifyToken,
  upload.array("imageFiles"),
  async (req: Request, res: Response) => {
    try {
      const updatedHotel: HotelType = req.body;
      updatedHotel.lastUpdated = new Date();

      const hotel = await Hotel.findOneAndUpdate(
        {
          _id: req.params.hotelId,
          userId: req.userId,
        },
        updatedHotel,
        { new: true }
      );
      if (!hotel) {
        return res.status(404).json({ messsage: "Hotel not Found" });
      }
      const files = req.files as Express.Multer.File[];
      const updatedimageUrls = await uploadImages(files);
      hotel.imageUrls = [
        ...updatedimageUrls,
        ...(updatedHotel.imageUrls || []),
      ];
      await hotel.save()
      res.status(201).json(hotel)
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went throw" });
    }
  }
);

async function uploadImages(imageFiles: Express.Multer.File[]) {
  const uploadPromises = imageFiles.map(async (image) => {
    const b64 = Buffer.from(image.buffer).toString("base64");
    let dataURI = "data:" + image.mimetype + ";base64," + b64;
    const res = await cloudinary.v2.uploader.upload(dataURI);
    return res.url;
  });

  // 2.if the image upload was succefull, add the urls to the new hotel
  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
}

export default router;
