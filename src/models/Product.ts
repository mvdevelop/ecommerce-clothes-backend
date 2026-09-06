import mongoose, { Schema, model, Document, Types } from "mongoose";

export type ProductCategory = "men" | "women" | "kids" | "accessories";

export interface IReview {
  user: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  category: ProductCategory;
  new_price: number;
  old_price?: number;
  image: string;
  available: boolean;
  stock: number;
  ratings: {
    average: number;
    count: number;
  };
  reviews: IReview[];
  isFeatured: boolean;
  dateAdded: Date;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      minlength: [10, "Description must be at least 10 characters"],
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      enum: ["men", "women", "kids", "accessories"] satisfies ProductCategory[],
      default: "men",
    },
    new_price: {
      type: Number,
      required: [true, "Please provide new price"],
      min: [0, "Price must be positive"],
    },
    old_price: {
      type: Number,
      min: [0, "Price must be positive"],
    },
    image: {
      type: String,
      required: [true, "Please provide product image"],
    },
    available: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock must be positive"],
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: [0, "Rating must be at least 0"],
        max: [5, "Rating must be at most 5"],
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
          minlength: [1, "Comment must be at least 1 character"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
productSchema.index({ category: 1, isFeatured: 1 });
productSchema.index({ name: "text", description: "text" });

const Product = model<IProduct>("Product", productSchema);
export default Product;