import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 

import MessagesComponent from "../features/messages/MessagesComponent";

export default function Main() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <MessagesComponent textInputStyle={styles.textInputStyle} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInputStyle: {
    backgroundColor: "#FFFFF0",
  },
});
