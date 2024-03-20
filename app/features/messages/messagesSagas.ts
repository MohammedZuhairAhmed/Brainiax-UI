import Constants from "expo-constants";
import { put, takeEvery, call } from "redux-saga/effects";

import { getReply, createReplyMessage } from "./messagesHelpers";
import { setMessages, sendMessage, setIsTyping } from "./messagesSlice";

// Our worker Sagas
function* sendMessageStart({ payload: message }) {
  yield put(setIsTyping(true));
  yield put(setMessages(message));
  try {
    const replyMessages = yield call(getReply, message);
    yield put(setMessages(replyMessages));
  } catch (error) {
    const errorMessage: string =
      Constants.expoConfig.extra?.messagesErrorMessage + error?.toString;
    yield put(setMessages(createReplyMessage(errorMessage)));
  }
  yield put(setIsTyping(false));
}

// Our watcher Sagas
function* messagesSaga() {
  yield takeEvery(sendMessage, sendMessageStart);
}

export { messagesSaga, sendMessageStart };
