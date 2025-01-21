import Joi from 'joi';

export const formatJoiErrorMessage = (errorDetails: Joi.ValidationErrorItem[]): string => {
  return errorDetails
    .map((detail) => {
      // Replace multiple quotes with single quotes
      let message = detail.message.replace(/['"]+/g, '');

      // Capitalize the first letter of the message
      message = message.charAt(0).toUpperCase() + message.slice(1);

      // Add a space after periods and commas, if not already present
      message = message.replace(/([.,])(?=\S)/g, '$1 ');

      return message;
    })
    .join(' ');
};
