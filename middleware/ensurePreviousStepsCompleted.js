// ensurePreviousStepsCompleted.js

// Function to get signup data from session
const getSignupData = (req) => {
  return req.session.signupData || {};
};

// Define required signup steps
const requiredSteps = [
  "firstName",
  "lastName",
  "email",
  "password",
  "phoneNumber",
  "address",
  "city",
  "state",
  "country",
  "postalCode",
  "avatarUser",
  "userName",
  "bio",
];

export const ensurePreviousStepsCompleted = (req, res, next) => {
  const signupData = getSignupData(req);

  // Check if all required steps are completed
  const missingSteps = requiredSteps.filter((step) => !signupData[step]);
  if (missingSteps.length > 0) {
    const message = `Please complete these steps before proceeding: ${missingSteps.join(", ")}`;
    return res.status(400).json({ message });
  }

  next();
};
