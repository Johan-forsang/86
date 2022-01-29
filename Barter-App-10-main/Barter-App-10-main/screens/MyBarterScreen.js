import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, StyleSheet } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import firebase from 'firebase';

import db from '../Config';
import AppHeader from '../components/AppHeader';

export default class MyBarterScreen extends React.Component {
    static navigationOptions = {
        header: null
    };

    constructor() {
        super();
        this.state = {
            userId: firebase.auth().currentUser.email,
            userName: '',
            allBarters: [],
        };
        this.requestRef = null;
    }

    getDonorDetails = () => {
        db.collection('users').where('email_id', '==', this.state.userId).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                this.setState({
                    userName: doc.data().first_name + ' ' + doc.data().last_name,
                });
            });
        });
    }

    getAllBarters = () => {
        this.requestRef = db.collection('barters').where('donor_id', '==', this.state.userId)
        .onSnapshot(snapshot => {
            var allBarters = []
            snapshot.docs.map((doc) => {
                var barter = doc.data();
                barter['doc_id'] = doc.id;
                allBarters.push(barter);
            });
            this.setState({
                allBarters : allBarters,
            });
        });
    }

    sendItem = (barterDetails) => {
        if(barterDetails.request_status === 'Item Sent') {
            var requestStatus = 'Donor Interested';

            db.collection('barters').doc(barterDetails.doc_id).update({
                request_status: requestStatus,
            });

            this.sendNotification(barterDetails, requestStatus)
        } else {
            var requestStatus = 'Item Sent';

            db.collection('barters').doc(barterDetails.doc_id).update({
                request_status: requestStatus,
            });

            this.sendNotification(barterDetails, requestStatus);
        }

        db.collection('requests').doc(barterDetails.request_doc_id).update({
            item_status: 'sent',
        })
    }

    sendNotification = (barterDetails, requestStatus) => {
        var requestId = barterDetails.exchange_id;
        var donorId = barterDetails.donor_id;
        var receiverId = barterDetails.receiver_id;
        var itemName = barterDetails.item_name;

        db.collection('notifications').where('exchange_id', '==', requestId).where('donor_id', '==', donorId).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                var message = '';
                var date = firebase.firestore.Timestamp.now().toDate();

                if(requestStatus === 'Item Sent') {
                    message = this.state.userName + ' has sent you the item.'
                } else {
                    message = this.state.userName + ' has shown interest in donating the item.'
                }

                db.collection('notifications').add({
                    donor_id: donorId,
                    targeted_user_id: receiverId,
                    date: date,
                    message: message,
                    item_name: itemName,
                    notification_status: 'unread',
                    exchange_id: requestId,
                });
            });
        });
    }

    keyExtractor = (item, index) => index.toString();

    renderItem = ({ item, i }) => {
        return(
            <ListItem
                key = { i }
                bottomDivider>
                <Icon 
                    name = 'shopping-cart'
                    type = 'font-awesome'
                    color = '#696969' />
                <ListItem.Title style = {{ color: 'black', fontWeight: 'bold' }}>
                    { item.item_name }
                </ListItem.Title>
                <ListItem.Subtitle>
                    { 'Requested By: ' + item.requested_by +'\nStatus : ' + item.request_status }
                </ListItem.Subtitle>
                {
                    item.request_status === 'Donor Interested'
                    ? (
                        <TouchableOpacity
                            style = { styles.button }
                            onPress = {() => {
                                this.sendItem(item);
                            }}>
                            <Text style = {{ color: '#ff5722', fontSize: 18, fontWeight: '300', padding: 20 }}>
                                Exchange
                            </Text>
                        </TouchableOpacity>
                    )
                    : null
                }
            </ListItem>
        )
    }

    componentDidMount() {
        this.getDonorDetails();
        this.getAllBarters();
    }

    componentWillUnmount() {
        this.requestRef();
    }

    render() {
        return(
            <View style = {{ flex: 1, backgroundColor: '#ffe0b2' }}>
                <AppHeader title = 'My Barters' navigation = { this.props.navigation } />
                <View style = { styles.container }>
                    {
                        this.state.allBarters.length === 0
                        ? (
                            <View style = {{
                                flex: 1,
                                fontSize: 20,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Text style = {{ fontSize: 20 }}>
                                    List of all Barters
                                </Text>
                            </View>
                        )
                        :(
                            <FlatList
                                keyExtractor = { this.keyExtractor }
                                data = { this.state.allBarters }
                                renderItem = { this.renderItem } />
                        )
                    }
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffe0b2',
        alignItems: 'center',
        marginTop: -300,
    },
    button: {
        width: 100,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        elevation: 10,
        padding: 20,
        borderWidth: 1,
        borderColor: '#ff5722',
    },
});