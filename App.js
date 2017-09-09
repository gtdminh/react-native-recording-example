import React from 'react';
import { TextInput, Text, Button, View, Image, FlatList } from 'react-native';
import styled from 'styled-components/native'
import Expo, { Audio, FileSystem, Permissions, Asset } from 'expo'
import IconButton from './src/IconButton'

const Container = styled.View`
  flex:1;
  background-color:#fff;
  paddingLeft:10;
  paddingRight:10;
  paddingBottom:10;
  paddingTop:30;
  justifyContent:flex-start;
  flexDirection:column;
`;

const Row = styled.View`
  flexDirection:row;
  alignItems:flex-start;
`
const StyledTextInput = styled.TextInput`
  flex:1;
  height:50;
`;

const FileList = styled.FlatList`
  flex:1;
  paddingTop:10;
`;

const FileListHeader = styled.View`
  height:30;
  backgroundColor: #007AFF;
  justifyContent:center;

`

const AppDir = FileSystem.documentDirectory + 'recorder/';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.recorder = null;
    this.state = {
      isRecording: false,
      items: [],
      text: ""
    }
    this.recordSettings = JSON.parse(JSON.stringify(Expo.Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY));
  }


  componentDidMount() {
    (async () => {
      try {
        let info = await (FileSystem.getInfoAsync(AppDir))
        if (!info.exists)
          await FileSystem.makeDirectoryAsync(AppDir);
        let uris = await FileSystem.readDirectoryAsync(AppDir)
        console.log(JSON.stringify(uris))
        this.setState({ items: uris });

        await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      }
      catch (err) {
        console.error(err);
        //FileSystem.makeDirectoryAsync(AppDir);
      }
    })();
  }


  render() {
    return (
      <Container>
        <Row>
          <StyledTextInput
            placeholder="Name your record"
            returnkeyType="done"
            value={this.state.text}
            onChangeText={(text) => this.setState({ text })}
          />
          <IconButton
            icon={this.state.isRecording ? "ios-mic-off" : "ios-mic"}
            title={this.state.isRecording ? "Stop" : "Record"}
            onPress={this.handleRecord}
          />
        </Row>
        <FileList
          ListHeaderComponent={() => {
            return (
              <FileListHeader>
                <Text>Recorded Files</Text>
              </FileListHeader>
            );
          }}
          
          data={this.state.items}
          renderItem={({ item }) => (<Text>{item}</Text>)}
          keyExtractor={(item, index) => index}
        />

        <Row>

        </Row>
      </Container>
    );
  }

  handleRecord = () => {
    if (!this.state.isRecording) {
      this._startRecord();
    }
    else {
      this._stopRecord();
    }
  }

  async _startRecord() {
    if (this.recorder == null) {
      this.recorder = new Expo.Audio.Recording();
    }
    try {

      await this.recorder.prepareToRecordAsync(this.recordSettings);
      await this.recorder.startAsync()
      this.setState({ isRecording: true })
    }
    catch (err) {
      console.error(err);
      delete this.recorder;
    }
  }

  async _stopRecord() {
    if (this.recorder) {
      try {
        await this.recorder.stopAndUnloadAsync();
        console.log('stop recording')
        const info = await FileSystem.getInfoAsync(this.recorder.getURI());
        console.log(`FILE INFO: ${JSON.stringify(info)}`);
        let uri = AppDir + this.state.text + '.mp3';
        await FileSystem.moveAsync({ from: info.uri, to: uri });
        this.setState((prevState) => { return { items: prevState.items.push(uri), text: "" } });
      }
      catch (err) {
        console.error(err);
      }
      finally {
        this.setState({ isRecording: false });
        this.recorder = null;
      }
    }
  }
}
