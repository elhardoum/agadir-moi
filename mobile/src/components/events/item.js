import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Story from './../news/item'

export default class Event extends Story
{
  constructor(props)
  {
    super(props)
    this.componentId = 'events'
  }

  content()
  {
    const { post } = this.props

    return <View style={{ flex: 1, marginTop: -15 }}>
      <View style={styles.contentWrapper}>
        <Text style={[styles.postTitle, styles.textCenter, {marginBottom: 15}]}>{post.title}</Text>
        <Text style={styles.postLocationText}>{post.location}</Text>
        <Text style={styles.postContent}>Hold them emails. I am still working in this view!</Text>
      </View>

      <View style={{...styles.contentWrapper, marginTop: 20, marginBottom: 20}}>
        <Text style={[styles.postTitle, styles.textCenter, {marginBottom: 15}]}>{i18n('About The Event')}</Text>
        <Text style={styles.postContent}>{post.content}</Text>
      </View>
    </View>
  }
}

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#eae9e5',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 15,
    marginLeft: 15,
    padding: 30,
  },
  postTitle: {
    color: '#197cce',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  postDate: {
    color: '#688085',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 15,
  },
  postContent: {
    color: '#6e8085',
    fontSize: 15,
  },
  textCenter: {
    textAlign: 'center',
  },
  postLocationText: {
    color: '#688085',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  }
})
