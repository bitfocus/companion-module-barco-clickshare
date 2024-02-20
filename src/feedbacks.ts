import { combineRgb } from '@companion-module/base'
import type { BarcoClickShareInstance } from './index.js'

export function UpdateFeedbacks(self: BarcoClickShareInstance): void {
	self.setFeedbackDefinitions({
        inUse: {
            type: 'boolean', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
            name: 'In Use',
            description: 'True if the app or a button is connected to the Clickshare',
            defaultStyle: {
                // The default style change for a boolean feedback
                // The user will be able to customise these values as well as the fields that will be changed
                color: combineRgb(0, 0, 0),
                bgcolor: combineRgb(255, 0, 0),
            },
            // options is how the user can choose the condition the feedback activates for
            options: [],
            callback: (_feedback): boolean => {
                // This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
                return !!self.isInUse
            },
            subscribe: () => {
                self.subscriptions++
            },
            unsubscribe: () => {
                self.subscriptions--
            },
        },
        sharing: {
            type: 'boolean', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
            name: 'Sharing',
            description: 'True if someone is streaming a desktop to the Clickshare',
            defaultStyle: {
                // The default style change for a boolean feedback
                // The user will be able to customise these values as well as the fields that will be changed
                color: combineRgb(0, 0, 0),
                bgcolor: combineRgb(255, 0, 0),
            },
            // options is how the user can choose the condition the feedback activates for
            options: [],
            callback: (_feedback): boolean => {
                // This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
                return !!self.isSharing
            },
            subscribe: () => {
                self.subscriptions++
            },
            unsubscribe: () => {
                self.subscriptions--
            },
        },
        idle: {
            type: 'boolean', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
            name: 'Idle',
            description: 'True if no one is connected to the Clickshare',
            defaultStyle: {
                // The default style change for a boolean feedback
                // The user will be able to customise these values as well as the fields that will be changed
                color: combineRgb(0, 0, 0),
                bgcolor: combineRgb(255, 0, 0),
            },
            // options is how the user can choose the condition the feedback activates for
            options: [],
            callback: (_feedback) => {
                // This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
                return !self.isInUse
            },
            subscribe: () => {
                self.subscriptions++
            },
            unsubscribe: () => {
                self.subscriptions--
            },
        },
        available: {
            type: 'boolean', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
            name: 'Available',
            description: 'True if some one is connected to the Clickshare but no one is streaming',
            defaultStyle: {
                // The default style change for a boolean feedback
                // The user will be able to customise these values as well as the fields that will be changed
                color: combineRgb(0, 0, 0),
                bgcolor: combineRgb(255, 0, 0),
            },
            // options is how the user can choose the condition the feedback activates for
            options: [],
            callback: (_feedback) => {
                // This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
                return !!self.isInUse && !self.isSharing
            },
            subscribe: () => {
                self.subscriptions++
            },
            unsubscribe: () => {
                self.subscriptions--
            },
        },
    })
}