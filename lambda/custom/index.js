/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const MESSAGES = {
  skillName: "Tides Info"
};

const PERMISSIONS = ['alexa:devices:all:address:country_and_postal_code:read'];

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {

    const {
      requestEnvelope,
      serviceClientFactory,
      responseBuilder
    } = handlerInput;

    const consentToken = requestEnvelope.context.System.user.permissions &&
      requestEnvelope.context.System.user.permissions.consentToken;
    if (!consentToken) {
      return responseBuilder
        .speak('We need your permissions to access your post code, please have a look at the Alexa App')
        .withAskForPermissionsConsentCard(PERMISSIONS)
        .getResponse();
    }
    
    const {
      deviceId
    } = requestEnvelope.context.System.device;
    const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
    const postcode = await deviceAddressServiceClient.getCountryAndPostalCode(deviceId);
    //const address = await deviceAddressServiceClient.getFullAddress(deviceId);

    console.log('Address successfully retrieved, now responding to user.', JSON.stringify(postcode));

    const speechText = 'Welcome to the Tides Info skill, you can ask for low or high tides for today or tomorrow. What would you like to do? ' + postcode;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(MESSAGES.skillName, speechText)
      .getResponse();
  },
};

const LowTidesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'LowTidesIntent';
  },
  handle(handlerInput) {
    const speechText = 'The next low tides today near you will be:';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(MESSAGES.skillName, speechText)
      .getResponse();
  },
};
const HighTidesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HighTidesIntent';
  },
  handle(handlerInput) {
    const speechText = 'High tides tomorrow near you will be:';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(MESSAGES.skillName, speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can ask for low or high tides for today or tomorrow. What would you like to do?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(MESSAGES.skillName, speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(MESSAGES.skillName, speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HighTidesIntentHandler,
    LowTidesIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
