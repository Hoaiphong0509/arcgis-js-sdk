require([
	// AUTHEN API KEY
	'esri/config',
	// DISPLAY MAP
	'esri/views/MapView',
	'esri/WebMap',
	// SAVE WEB MAP
	'esri/widgets/LayerList',
	'esri/widgets/BasemapGallery',
	'esri/widgets/Legend',
	'esri/widgets/Expand',
	'esri/widgets/Search',
	// Route
	'esri/rest/route',
	'esri/rest/support/RouteParameters',
	'esri/rest/support/FeatureSet',
	//  FeatureLayer
	'esri/layers/FeatureLayer',
	'esri/Graphic',
	// Auth
	'esri/portal/Portal',
	'esri/identity/OAuthInfo',
	'esri/identity/IdentityManager'
], function (
	esriConfig,
	MapView,
	WebMap,
	LayerList,
	BasemapGallery,
	Legend,
	Expand,
	Search,
	route,
	RouteParameters,
	FeatureSet,
	FeatureLayer,
	Graphic,
	Portal,
	OAuthInfo,
	esriId
) {
	// Authen, API KEY
	esriConfig.apiKey = 'AAPK584432533b2d450aa1896d7cd53a5bdf-p5aIT04Tgcr2-yZGHhIr3dvdii2omJT8hDsLhIDao_HS6PETYveE1cI4tbIizqR';

	// LIST WEBMAPIDS
	const webmapids = [
		'803871218002404fb78a1785c58a297b', // <- CHÍNH
		'ad5759bf407c4554b748356ebe1886e5',
		'45ded9b3e0e145139cc433b503a8f5ab'
	];

	const info = new OAuthInfo({
		appId: 'lmCEozrsRQ2IWerS',
		popup: false // the default
	});
	esriId.registerOAuthInfos([info]);

	function handleSignedIn() {

		const portal = new Portal();
		portal.load().then(() => {
			const results = {
				name: portal.user.fullName,
				username: portal.user.username
			};
			document.getElementById('results').innerText = JSON.stringify(results, null, 2);
		});

	}

	esriId
		.checkSignInStatus(info.portalUrl + '/sharing')
		.then(() => {
			handleSignedIn();
		})
		.catch(() => {
			handleSignedOut();
		});

	function handleSignedOut() {
		document.getElementById('results').innerText = 'Signed Out'
	}

	// Display web map
	/************************************************************
	 * Creates a new WebMap instance. A WebMap must reference
	 * a PortalItem ID that represents a WebMap saved to
	 * arcgis.com or an on-premise portal.
	 *
	 * To load a WebMap from an on-premise portal, set the portal
	 * url with esriConfig.portalUrl.
	 ************************************************************/
	const webmaps = webmapids.map((webmapid) => {
		return new WebMap({
			portalItem: {
				// autocasts as new PortalItem()
				id: webmapid
			}
		});
	});

	document.getElementById("sign-in").addEventListener("click", function () {
		esriId.getCredential(info.portalUrl + "/sharing");
	});
	document.getElementById("sign-out").addEventListener("click", function () {
		esriId.destroyCredentials();
		window.location.reload();
	});
	/************************************************************
	 * Set the WebMap instance to the map property in a MapView.
	 ************************************************************/
	const view = new MapView({
		map: webmaps[0],
		container: 'viewDiv'
	});

	// Save a web map
	// add legend, layerlist and basemapGallery widgets
	view.ui.add(
		[
			new Expand({
				content: new Search({
					view: view
				}),
				view: view,
				group: 'top-left'
			}),
			new Expand({
				content: new Legend({
					view: view
				}),
				view: view,
				group: 'top-left'
			}),
			new Expand({
				content: new LayerList({ view: view }),
				view: view,
				expandIcon: 'filter',
				group: 'top-left'
			}),
			new Expand({
				content: new BasemapGallery({
					view: view
				}),
				view: view,
				expandIcon: 'basemap',
				group: 'top-left'
			})
		],
		'top-left'
	);

	view.ui.add(
		[
			new Expand({
				content: document.getElementById('actions'),
				view: view,
				group: 'top-right'
			})
		],
		'top-right'
	);

	document.querySelector('.btns').addEventListener('click', (event) => {
		/************************************************************
		 * On a button click, change the map of the View
		 ************************************************************/
		const id = event.target.getAttribute('data-id');
		if(id) {
			const webmap = webmaps[id];
			view.map = webmap;
			const nodes = document.querySelectorAll('.btn-switch');
			for (let idx = 0; idx < nodes.length; idx++) {
				const node = nodes[idx];
				const mapIndex = node.getAttribute('data-id');
				if(mapIndex === id) {
					node.classList.add('active-map');
				} else {
					node.classList.remove('active-map');
				}
			}
		}
	});
	// Tìm Asheville, NC, USA
	const featureLayer = new FeatureLayer({
		url: 'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Landscape_Trees/FeatureServer/0'
	});

	webmaps[0].add(featureLayer);

	// IMPORTANT ⭐⭐ QUAN TRỌNG
	// Add Features
	const demoFeatureLayer = new FeatureLayer({
		// create an instance of esri/layers/support/Field for each field object
		title: 'HOT SPOT 🔥',
		fields: [
			{
				name: 'ObjectID',
				alias: 'ObjectID',
				type: 'oid'
			},
			{
				name: 'Name',
				alias: 'Name',
				type: 'string'
			},
			{
				name: 'Type',
				alias: 'Type',
				type: 'string'
			}
		],
		objectIdField: 'ObjectID',
		geometryType: 'point',
		spatialReference: { wkid: 4326 },
		source: [], // adding an empty feature collection
		renderer: {
			type: 'simple',
			symbol: {
				type: 'simple-marker',
				size: 32,
				color: '#ef4444',
				outline: {
					width: 0.5,
					color: '#450a0a'
				}
			}
		},
		popupTemplate: {
			title: '{Name}'
		}
	});
	webmaps[0].add(demoFeatureLayer);

	const addBtn = document.getElementById('add');
	const removeBtn = document.getElementById('remove');

	addBtn.addEventListener('click', addFeatures);
	removeBtn.addEventListener('click', removeFeatures);

	// fires when "Add Features" button is clicked
	function addFeatures() {
		// data to be added to the map
		const data = [
			{
				LATITUDE: 10.7430419,
				LONGITUDE: 106.6994789,
				TYPE: 'HOT SPOT 🔥',
				NAME: 'VStar School'
			},
			{
				LATITUDE: 10.7413137,
				LONGITUDE: 106.6980186,
				TYPE: 'HOT SPOT 🔥',
				NAME: 'Sunrise'
			},
			{
				LATITUDE: 10.7622535,
				LONGITUDE: 106.6662267,
				TYPE: 'HOT SPOT 🔥',
				NAME: 'Đại học Tôn Đức Thắng'
			},
			{
				LATITUDE: 10.7289567,
				LONGITUDE: 106.6908958,
				TYPE: 'HOT SPOT 🔥',
				NAME: 'RMIT Vietnam'
			}
		];

		// create an array of graphics based on the data above
		let graphics = [];
		let graphic;
		for (let i = 0; i < data.length; i++) {
			graphic = new Graphic({
				geometry: {
					type: 'point',
					latitude: data[i].LATITUDE,
					longitude: data[i].LONGITUDE
				},
				attributes: data[i]
			});
			graphics.push(graphic);
		}

		// addEdits object tells applyEdits that you want to add the features
		const addEdits = {
			addFeatures: graphics
		};

		// apply the edits to the layer
		applyEditsToLayer(addEdits);
	}

	// fires when "Remove Features" button clicked
	function removeFeatures() {
		// query for the features you want to remove
		demoFeatureLayer.queryFeatures().then((results) => {
			// edits object tells apply edits that you want to delete the features
			const deleteEdits = {
				deleteFeatures: results.features
			};
			// apply edits to the layer
			applyEditsToLayer(deleteEdits);
		});
	}

	function applyEditsToLayer(edits) {
		demoFeatureLayer
			.applyEdits(edits)
			.then((results) => {
				// if edits were removed
				if(results.deleteFeatureResults.length > 0) {
					console.log(
						results.deleteFeatureResults.length,
						'features have been removed'
					);
					addBtn.disabled = false;
					removeBtn.disabled = true;
				}
				// if features were added - call queryFeatures to return
				//    newly added graphics
				if(results.addFeatureResults.length > 0) {
					let objectIds = [];
					results.addFeatureResults.forEach((item) => {
						objectIds.push(item.objectId);
					});
					// query the newly added features from the layer
					demoFeatureLayer
						.queryFeatures({
							objectIds: objectIds
						})
						.then((results) => {
							console.log(
								results.features.length,
								'features have been added.'
							);
							addBtn.disabled = true;
							removeBtn.disabled = false;
						});
				}
			})
			.catch((error) => {
				console.error();
			});
	}

	// Legendary
	const legend = new Legend({
		view: view
	});
	view.ui.add(legend, 'bottom-left');

	// FIND ROUTE
	const routeUrl = 'https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World';
	view.on('click', function (event) {
		if(view.graphics.length === 0) {
			addGraphic('origin', event.mapPoint);
		} else if(view.graphics.length === 1) {
			addGraphic('destination', event.mapPoint);

			getRoute(); // Call the route service

		} else {
			view.graphics.removeAll();
			addGraphic('origin', event.mapPoint);
		}

	});

	function addGraphic(type, point) {
		const graphic = new Graphic({
			symbol: {
				type: 'simple-marker',
				color: (type === 'origin') ? 'white' : 'black',
				size: '8px'
			},
			geometry: point
		});
		view.graphics.add(graphic);
	}

	function getRoute() {
		const routeParams = new RouteParameters({
			stops: new FeatureSet({
				features: view.graphics.toArray()
			}),

			returnDirections: true

		});

		route.solve(routeUrl, routeParams)
			.then(function (data) {
				data.routeResults.forEach(function (result) {
					result.route.symbol = {
						type: 'simple-line',
						color: [5, 150, 255],
						width: 3
					};
					view.graphics.add(result.route);
				});

				// Display directions
				if(data.routeResults.length > 0) {
					const directions = document.createElement('ol');
					directions.classList = 'esri-widget esri-widget--panel esri-directions__scroller';
					directions.style.marginTop = '0';
					directions.style.padding = '15px 15px 15px 30px';
					const features = data.routeResults[0].directions.features;

					// Show each direction
					features.forEach(function (result, i) {
						const direction = document.createElement('li');
						direction.innerHTML = result.attributes.text + ' (' + result.attributes.length.toFixed(2) + ' miles)';
						directions.appendChild(direction);
					});

					view.ui.empty('top-right');
					view.ui.add(directions, 'top-right');

				}

			})

			.catch(function (error) {
				console.log(error);
			})

	}

	// Save a web map: FAILED ❌❌❌
	// view.when(() => {
	// 	// When the webmap and view resolve, display the webmap's
	// 	// new title in the Div
	// 	const title = document.getElementById('webMapTitle');
	// 	const save = document.getElementById('saveWebMap');
	// 	save.disabled = false;
	// 	save.addEventListener('click', () => {
	// 		// item automatically casts to a PortalItem instance by saveAs
	// 		const item = {
	// 			title: title.value
	// 		};
	//
	// 		// Update properties of the WebMap related to the view.
	// 		// This should be called just before saving a webmap.
	// 		webmap.updateFrom(view).then(() => {
	// 			webmap
	// 				.saveAs(item)
	// 				// Saved successfully
	// 				.then((item) => {
	// 					// link to the newly-created web scene item
	// 					const itemPageUrl = `${item.portal.url}/home/item.html?id=${item.id}`;
	// 					const link = `<a target='_blank' href='${itemPageUrl}'>${title.value}</a>`;
	//
	// 					statusMessage(
	// 						'Save WebMap',
	// 						`<br> Successfully saved as <i>${link}</i>`
	// 					);
	// 				})
	// 				// Save didn't work correctly
	// 				.catch((error) => {
	// 					if(error.name != 'identity-manager:user-aborted') {
	// 						statusMessage('Save WebMap', `<br> Error ${error}`);
	// 					}
	// 				});
	// 		});
	// 	});
	//
	// 	const overlay = document.getElementById('overlayDiv');
	// 	const ok = overlay.getElementsByTagName('input')[0];
	//
	// 	function statusMessage(head, info) {
	// 		document.getElementById('head').innerHTML = head;
	// 		document.getElementById('info').innerHTML = info;
	// 		overlay.style.visibility = 'visible';
	// 	}
	//
	// 	ok.addEventListener('click', () => {
	// 		overlay.style.visibility = 'hidden';
	// 	});
	//
	// 	view.ui.add('sidebarDiv', 'top-right');
	// });
	//
});