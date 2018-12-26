import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withNamespaces } from 'react-i18next';
import { Helmet } from 'react-helmet';

import { colors as viewColors } from 'components/NavBar/NavBar.jsx';
import { opts as mapOpts } from 'views/Map/Map.jsx';

import './Settings.css';

class Settings extends Component {
	
	hideKeyboard = (e) => {
		if (e.which === 13) e.target.blur();
	}
	
	updateSetting = (e) => {
		const target = e.target;
		this.props.storeSettings.update(target.name, target.valueAsNumber || target.value || target.options ? target.options[e.target.selectedIndex].value : this.props.storeSettings.defaultData[target.name], true);
	}
	
	render() {
		
		const { t, storeSettings: { data, defaultData } } = this.props;
		
		return (
			<>
				<Helmet>
					<meta name="theme-color" content={viewColors.settings[0]} />
				</Helmet>
				<main id="settings" className="view">
					<label className="is-select"><i className="material-icons">language</i>{t('settings.language')}<span>({defaultData.lang})</span></label>
					<select name="lang" defaultValue={data.lang} onInput={this.updateSetting}>
						<option value="et">Eesti keel</option>
						<option value="en">English</option>
						<option value="ru">Русский</option>
					</select>
					<label className="is-select"><i className="material-icons">style</i>{t('settings.theme')}<span>({t(`settings.theme-${defaultData.theme}`)})</span></label>
					<select name="theme" defaultValue={data.theme} onInput={this.updateSetting}>
						<option value="light">{t('settings.theme-light')}</option>
						<option value="dark">{t('settings.theme-dark')}</option>
					</select>
					<label className="is-select"><i className="material-icons">view_carousel</i>{t('settings.view')}<span>({t(`settings.view-${defaultData.view}`)})</span></label>
					<select name="view" defaultValue={data.view} onInput={this.updateSetting}>
						<option value="search">{t('settings.view-search')}</option>
						<option value="favorites">{t('settings.view-favorites')}</option>
						<option value="map">{t('settings.view-map')}</option>
					</select>
					<label><i className="material-icons">search</i>{t('settings.startZoom')}<span>({defaultData.startZoom})</span></label>
					<input name="startZoom" defaultValue={data.startZoom} type="number" min={mapOpts.minZoom} max={mapOpts.maxZoom} onKeyDown={this.hideKeyboard} onInput={this.updateSetting}></input>
					<label><i className="material-icons">visibility</i>{t('settings.stopZoom')}<span>({defaultData.stopZoom})</span></label>
					<input name="stopZoom" defaultValue={data.stopZoom} type="number" min={mapOpts.minZoom} max={mapOpts.maxZoom} onKeyDown={this.hideKeyboard} onInput={this.updateSetting}></input>
					<img src="https://raw.githubusercontent.com/karlkoorna/bussiaeg/master/web/public/assets/banner-1.svg?sanitize=true" alt="Bussiaeg.ee" />
					<p>
						<a rel="nofollow" target="_blank" href="https://mnt.ee">Maanteeamet</a> ― Plaaniajad.<br />
						<a rel="nofollow" target="_blank" href="https://tallinnlt.ee">Tallinna Linna Transport</a> ― Reaalajad Tallinnas.<br />
						<a rel="nofollow" target="_blank" href="http://elron.ee/">Elron</a> ― Rongiajad.
					</p>
				</main>
			</>
		);
		
	}
	
}

export default withNamespaces()(inject('storeSettings')(observer(Settings)));
