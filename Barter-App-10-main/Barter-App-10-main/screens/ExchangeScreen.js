import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import firebase from 'firebase';

import db from '../Config';
import AppHeader from '../components/AppHeader';

export default class ExchangeScreen extends React.Component {
    constructor() {
        super();
        this.state = {
            userName : firebase.auth().currentUser.email,
            itemName: '',
            description: '',
            userDocId: '',
            isExchangeRequestActive: '',
            exchangeId: '',
            itemStatus: '',
            requestDocId: '',
            requestedItemName: '',
        }
    }

    getIsExchangeRequestActive = () => {
        db.collection('users').where('email_id', '==', this.state.userName).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                this.setState({
                    isExchangeRequestActive: doc.data().is_exchange_request_active,
                    userDocId: doc.id,
                });
            });
        });
    }

    getExchangeRequest = () => {
        db.collection('requests').where('username', '==', this.state.userName).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                if(doc.data().item_status !== 'received'){
                    this.setState({
                        exchangeId: doc.data().exchange_id,
                        requestedItemName: doc.data().item_name,
                        itemStatus: doc.data().item_status,
                        requestDocId: doc.id,
                    });
                };
            });
        });
    }

    createUniqueId() {
        return Math.random().toString(36).substring(7);
    }

    addItem = (itemName, description) => {
        var userName = this.state.userName;
        var exchangeId = this.createUniqueId();

        db.collection('requests').add({
            username: userName,
            item_name: itemName,
            description: description,
            exchange_id: exchangeId,
            item_status: 'requested',
            date: firebase.firestore.Timestamp.now().toDate(),
        });

        db.collection('users').doc(this.state.userDocId).update({
            is_exchange_request_active: true,
        });

        this.setState({
            itemName: '',
            description: '',
            isExchangeRequestActive: true,
        });

        return alert(
            'Item now ready for exchange.',
            '',
            [{
                text: 'OK',
                onPress: () => {
                    this.props.navigation.navigate('Home')
                }
            }]
        )
    }

    receivedItem = (itemName) => {
        var userId = this.state.userName;
        var exchangeId = this.state.exchangeId;

        db.collection('deliveries').add({
            receiver_id: userId,
            exchange_id: exchangeId,
            item_name: itemName,
            item_status: 'received',
        });
    }

    updateExchangeRequestStatus = () => {
        db.collection('users').doc(this.state.userDocId).update({
            is_exchange_request_active: false,
        });

        db.collection('requests').doc(this.state.requestDocId).update({
            item_status: 'received',
        });

        this.setState({
            isExchangeRequestActive: false,
        })
    }

    sendNotification = () => {
        db.collection('users').where('email_id', '==', this.state.userName).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                var name = doc.data().first_name;
                var lastName = doc.data().last_name;

                db.collection('barters').where('exchange_id', '==', this.state.exchangeId).get()
                .then(snapshot => {
                    snapshot.forEach(doc => {
                        var donorId = doc.data().donor_id;
                        var itemName = doc.data().item_name;

                        db.collection('notifications').add({
                            targeted_user_id: donorId,
                            message: name + ' ' + lastName + ' has received the item: ' + itemName,
                            notification_status: 'unread',
                            item_name: itemName,
                            date: firebase.firestore.Timestamp.now().toDate(),
                            exchange_id: this.state.exchangeId,
                        });
                    });
                });
            });
        });
    }

    componentDidMount() {
        this.getIsExchangeRequestActive();
        this.getExchangeRequest();
    }

    render() {
        if(this.state.isExchangeRequestActive === true){
            return(
                <View style = { styles.container }>
                    <View style = { styles.statusContainer}>
                        <Text style = {{ fontWeight: 'bold' }}>
                            Item Name:
                        </Text>
                        <Text>
                            { this.state.requestedItemName }
                        </Text>
                    </View>
                    <View style = { styles.statusContainer}>
                        <Text style = {{ fontWeight: 'bold' }}>
                            Item Status:
                        </Text>
                        <Text>
                            { this.state.itemStatus }
                        </Text>
                    </View>
                    {
                        this.state.itemStatus === 'sent'
                        ? (
                            <TouchableOpacity
                                style = { styles.receivedButton }
                                onPress = {() => {
                                    this.receivedItem(this.state.requestedItemName);
                                    this.updateExchangeRequestStatus();
                                    this.sendNotification();
                                }}>
                                <Text style = {{ color: '#000000', fontSize: 18, fontWeight: '300', padding: 20 }}>
                                    Item Received
                                </Text>
                            </TouchableOpacity>
                        )
                        : null
                    }
                </View>
            )
        } else {
            return(
                <View style = {{ flex: 1, backgroundColor: '#ffe0b2' }}>
                    <AppHeader title = 'Exchange' navigation = { this.props.navigation } />
                    <KeyboardAvoidingView style = { styles.profileContainer }>
                        <TextInput
                            style = { styles.formTextInput }
                            placeholder = 'Item Name'
                            onChangeText = {(text) => {
                                this.setState({
                                    itemName: text
                                });
                            }}
                            value = { this.state.itemName } />
                        <TextInput
                            style = {[ styles.formTextInput, { height: 100 } ]}
                            placeholder = 'Description'
                            numberOfLines = { 4 }
                            onChangeText = {(text) => {
                                this.setState({
                                    description: text
                                });
                            }}
                            value = { this.state.description }
                            multiline />
                        <TouchableOpacity
                            style = { styles.button }
                            onPress = {() => {
                                this.addItem(this.state.itemName, this.state.description)
                            }}>
                            <Text style = { styles.buttonText }>
                                Add Item
                            </Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffe0b2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileContainer: {
        padding: 50,
        marginTop: -200,
        flex: 1,
        backgroundColor: '#ffe0b2',
        alignItems: 'center',
    },
    formTextInput: {
        width: 300,
        height: 35,
        borderWidth: 1.5,
        borderColor: '#ffab91',
        fontSize: 20,
        marginBottom: 20,
        marginTop: 5,
        color: 'black',
    },
    buttonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: 300,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        backgroundColor: '#ffffff',
        elevation: 10,
    },
    buttonText: {
        color: '#ff5722',
        fontSize: 18,
        fontWeight: 'bold',
    },
    statusContainer: {
        borderColor: '#ffab91',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        margin: 10,
    },
    receivedButton: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        elevation: 10,
        padding: 20,
        borderWidth: 1,
        borderColor: '#ffab91',
    },
});