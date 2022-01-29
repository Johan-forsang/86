import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import firebase from 'firebase';

import db from '../Config';
import AppHeader from '../components/AppHeader';
import SwipeableFlatlist from '../components/SwipeableFlatlist';

export default class NotificationsScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: firebase.auth().currentUser.email,
            allNotifications: [],
            allReadNotifications: [],
        };
        this.notificationRef = null;
    }

    getNotifications = () => {
        this.notificationRef = db.collection('notifications').where('targeted_user_id', '==', this.state.userId).where('notification_status', '==', 'unread')
        .onSnapshot(snapshot => {
            var allNotifications = [];

            snapshot.docs.map(doc => {
                var notification = doc.data();
                notification['doc_id'] = doc.id;
                allNotifications.push(notification);
            });

            this.setState({
                allNotifications: allNotifications,
            });
        });
    }

    getReadNotifications = () => {
        this.notificationRef = db.collection('notifications').where('targeted_user_id', '==', this.state.userId).where('notification_status', '==', 'read')
        .onSnapshot(snapshot => {
            var allReadNotifications = [];

            snapshot.docs.map(doc => {
                var notification = doc.data();
                notification['doc_id'] = doc.id;
                allReadNotifications.push(notification);
            });

            this.setState({
                allReadNotifications: allReadNotifications,
            });
        });
    }

    componentDidMount() {
        this.getNotifications();
        this.getReadNotifications();
    }

    componentWillUnmount() {
        this.notificationRef();
    }

    keyExtractor = (item, index) => index.toString();

    renderItem = ({ item, i }) => {
        return(
            <ListItem
                key = { i }
                bottomDivider>
                <Icon 
                    name = 'bell'
                    type = 'font-awesome'
                    color = '#696969' />
                <ListItem.Title style = {{ color: 'black', fontWeight: 'bold' }}>
                    { item.item_name }
                </ListItem.Title>
                <ListItem.Subtitle>
                    { item.message }
                </ListItem.Subtitle>
            </ListItem>
        )
    }

    render() {
        return(
            <SafeAreaProvider>
                <View style = {{ flex: 1, backgroundColor: '#ffe0b2' }}>
                    <AppHeader title = 'Notifications' navigation = { this.props.navigation } />
                    <View style = { styles.container }>
                        {
                            this.state.allNotifications.length === 0
                            ? (
                                <View 
                                    style = {{
                                        flex: 1,
                                        justifyContent:'center',
                                        alignItems:'center'
                                    }}>
                                    <Text style = {{ fontSize: 25 }}>
                                        You have no notifications
                                    </Text>
                                </View>
                            )
                            :(
                                <SwipeableFlatlist 
                                    allNotifications = { this.state.allNotifications } />
                            )
                        }
                    </View>
                </View>
            </SafeAreaProvider>
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
    tinyHeader: {
        color: '#ff5722',
        fontSize: 18,
        fontWeight: 'bold',
    },
});