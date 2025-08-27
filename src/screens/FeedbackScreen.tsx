import React, { useState } from 'react';
import { Text, TextInput, Pressable } from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import { colors } from '../theme/colors';
import Screen from './_layout/Screen';

export default function FeedbackScreen(){
  const [msg,setMsg] = useState('');
  function send() {
    if (msg.trim()) {
      MailComposer.composeAsync({
        recipients: ['support@echovoid.com'],
        subject: 'User Feedback',
        body: msg,
      }).then(() => {
        setMsg('');
        alert('Feedback sent successfully!');
      }).catch((error: Error) => {
        console.error('Failed to send feedback:', error.message);
        alert(`Failed to send feedback: ${error.message}`);
      });
    } else {
      alert('Please enter your feedback before sending.');
    }
  }
  return (
    <Screen style={{flex:1, backgroundColor:colors.bg, padding:16}}>
      <Text style={{color:colors.text, marginBottom:8}}>Feedback</Text>
      <TextInput value={msg} onChangeText={setMsg} placeholder="share your thoughts" placeholderTextColor="#555" multiline style={{borderColor:colors.neon,borderWidth:1,color:colors.text,padding:8,minHeight:120}}/>
      <Pressable onPress={send} style={{marginTop:12,padding:12,borderWidth:1,borderColor:colors.neon,alignSelf:'flex-start'}}>
        <Text style={{color:colors.neon}}>Send</Text>
      </Pressable>
    </Screen>
  );
}
