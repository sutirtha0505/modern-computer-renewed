import Razorpay from 'razorpay';

// Ensure that you declare types for your environment variables if not already done
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID as string, // Server-side key
  key_secret: process.env.RAZORPAY_KEY as string, // Server-side secret
});

export default razorpay;
