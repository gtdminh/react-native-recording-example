import React, { Component } from 'react'
import {View, TouchableHighlight, Text, Button} from 'react-native'
import {Ionicons} from '@expo/vector-icons'
import styled from 'styled-components/native';

const Container = styled.View`
    flexDirection:row;
    alignItems:center;
    justifyContent:center;  
    height:50;
`;

export default class IconButton extends Component {

  render() {
    return (
      <TouchableHighlight onPress={this.props.onPress} activeOpacity={50} style={{backgroundColor:"#007AFF"}}>
        <Container>
            <Ionicons name={this.props.icon} size={32} color="green"/>
            <Text>{this.props.title}</Text> 
        </Container>
      </TouchableHighlight>
    )
  }
}
