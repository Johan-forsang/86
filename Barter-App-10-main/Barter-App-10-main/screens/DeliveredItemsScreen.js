import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import firebase from 'firebase';

import db from '../Config';
import AppHeader from '../components/AppHeader';

export default class DeliveredItemsScreen extends React.Component {
    constructor() {
        super();
        this.state = {
            userId: firebase.auth().currentUser.email,
            receivedItemsList: [],
        };
        this.receivedRef = null;
    }

    getReceivedItemsList = () => {
        this.receivedRef = db.collection('deliveries').where('receiver_id', '==', this.state.userId)
        .onSnapshot(snapshot => {
            var receivedItemsList = snapshot.docs.map(document => document.data());
            this.setState({
                receivedItemsList: receivedItemsList,
            });
        });
    }

    componentDidMount() {
        this.getReceivedItemsList();
    }

    componentWillUnmount() {
        this.receivedRef();
    }

    keyExtractor = (item, index) => index.toString();

    renderItem = ({ item, i }) => {
        return(
            <ListItem
                key = { i }
                bottomDivider>
                <Icon
                    name = 'truck'
                    type = 'font-awesome'
                    color = '#696969' />
                <ListItem.Title style = {{ color: 'black', fontWeight: 'bold' }}>
                    { item.item_name }
                </ListItem.Title>
                <ListItem.Subtitle>
                    { item.item_status }
                </ListItem.Subtitle>
            </ListItem>
        );
    }

    render() {
        return(
            <View style = {{ flex: 1, backgroundColor: '#ffe0b2' }}>
                <AppHeader title = 'Received Items' navigation = { this.props.navigation } />
                <View style = { styles.container }>
                    {
                        this.state.receivedItemsList.length === 0
                        ? (
                            <View style = {{
                                flex: 1,
                                fontSize: 20,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Text style = {{ fontSize: 20 }}>
                                    List of all Received Items
                                </Text>
                            </View>
                        )
                        : (
                            <FlatList
                                data = { this.state.receivedItemsList }
                                keyExtractor = { this.keyExtractor }
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
});