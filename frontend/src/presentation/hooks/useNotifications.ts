import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const useNotifications = () => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    const registerForPushNotifications = async () => {
        
        if (!Device.isDevice) {
            console.warn("Les notifications ne marchent pas sur simulateur");
            return null;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            console.warn("Permission refusée");
            return null;
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;


        if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
            });
        }
        console.log(token)
        return token;
    };

    useEffect(() => {
        registerForPushNotifications().then(setExpoPushToken);

        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            console.log("Notification reçue:", notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log("Notification cliquée:", response);
        });

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);

    return { expoPushToken };
};