import { Regex, SomeCompanionConfigField } from '@companion-module/base'

export interface BarcoClickShareConfig {
	host: string
	port: number
	user: string
	password: string
}

export function getConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Clickshare IP Address',
			width: 6,
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Clickshare API Port',
			width: 6,
			min: 1,
			max: 65536,
			default: 4003,
		},
		{
			type: 'textinput',
			id: 'user',
			label: 'Clickshare API Username',
			width: 6,
		},
		{
			type: 'textinput',
			id: 'password',
			label: 'Clickshare API Password',
			width: 6,
		},
	]
}
