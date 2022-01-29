import React from 'react';
import { Animated, View, Text, Dimensions, StyleSheet } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';

import db from '../Config';

export default class SwipeableFlatlist extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            allNotifications : this.props.allNotifications,
        };
    }

    updateMarkAsread = (notification) => {
        db.collection('notifications').doc(notification.doc_id).update({
            notification_status: 'read'
        });
    }

    onSwipeValueChange = (swipeData) => {
        var allNotifications = this.state.allNotifications;
        const { key, value } = swipeData;

        if(value < -Dimensions.get('window').width) {
            const newData = [...allNotifications];
            const prevIndex = allNotifications.findIndex(item => item.key === key);

            this.updateMarkAsread(allNotifications[prevIndex]);
            newData.splice(prevIndex, 1);
            this.setState({
                allNotifications : newData,
            })
        };
    };

    renderItem = (data) => {
        return(
            <Animated.View>
                <ListItem
                    bottomDivider>
                    <Icon 
                        name = 'bell'
                        type = 'font-awesome'
                        color = '#696969' />
                    <ListItem.Title style = {{ color: 'black', fontWeight: 'bold' }}>
                        { data.item.item_name }
                    </ListItem.Title>
                    <ListItem.Subtitle>
                        { data.item.message }
                    </ListItem.Subtitle>
                </ListItem>
            </Animated.View>
        );
    }

    renderHiddenItem = () => (
        <View style = { styles.rowBack }>
            <View style = {[ styles.backRightBtn, styles.backRightBtnRight ]}>
                <Text style = { styles.backTextWhite }>
                    Mark as Read
                </Text>
            </View>
        </View>
    );

    render() {
        return(
            <View style = { styles.container }>
                <SwipeListView
                    disableRightSwipe
                    data = { this.state.allNotifications }
                    renderItem = { this.renderItem }
                    renderHiddenItem = { this.renderHiddenItem }
                    rightOpenValue = { -Dimensions.get('window').width }
                    previewRowKey = { '0' }
                    previewOpenValue = { -40 }
                    previewOpenDelay = { 3000 }
                    onSwipeValueChange = { this.onSwipeValueChange } />
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffe0b2',
        alignItems: 'center',
    },
    backTextWhite: {
        color: '#FFF',
        fontWeight:'bold',
        fontSize:15
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#29b6f6',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 100,
    },
    backRightBtnRight: {
        backgroundColor: '#29b6f6',
        right: 0,
    },
});
