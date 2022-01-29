import React from 'react';
import { createDrawerNavigator } from 'react-navigation-drawer';

import { TabNavigator } from './TabNavigator';
import CustomSideBarMenu from './CustomSideBarMenu';
import SettingScreen from '../screens/SettingScreen';
import MyBarterScreen from '../screens/MyBarterScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import DeliveredItemsScreen from '../screens/DeliveredItemsScreen';

export const DrawerNavigator = createDrawerNavigator({
    Home: {
        screen: TabNavigator,
    },
    'My Barters': {
        screen: MyBarterScreen,
    },
    'Delivered Items': {
        screen: DeliveredItemsScreen,
    },
    Notifications: {
        screen: NotificationsScreen,
    },
    Settings: {
        screen: SettingScreen,
    },
},
{
    contentComponent: CustomSideBarMenu,
},
{
    initialRouteName: 'Home',
});