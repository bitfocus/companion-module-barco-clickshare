import { Regex } from '@companion-module/base'
import type { BarcoClickShareInstance } from './index.js'

export function UpdateActions(self: BarcoClickShareInstance): void {
	self.setActionDefinitions({
		selectWallpaper: {
			name: 'Select Wallpaper',
			options: [
				{
					id: 'wallpaperId',
					type: 'textinput',
					label: 'ID of wallpaper',
					default: '1001',
					regex: Regex.NUMBER,
					useVariables: true,
					tooltip: 'default wallpapers have ID 1 and 2, user wallpapers start at 1001'
				},
			],
			callback: async ({options})=> {
				const wallpaperId = await self.parseVariablesInString(options.wallpaperId as string)
				self.log('info', 'switching to wallpaper ID ' + wallpaperId)
				self.selectWallpaper(parseInt(wallpaperId))
			},
		},
	})
}