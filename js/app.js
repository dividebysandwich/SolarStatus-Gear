/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jshint unused: vars*/

(function() {
	var XML_ADDRESS = "http://boeheim.duckdns.org/status/soc.txt",
	XML_METHOD = "GET",
	MSG_ERR_NODATA = "No PV power status available.",
	MSG_ERR_NOTCONNECTED = "Connection aborted. Check your internet connection.",
	NUM_MAX_NEWS = 5,
	NUM_MAX_LENGTH_SUBJECT = 64,
	arrayData = [],
	TFT_WHITE = "#ffffff",
	TFT_DARKGREY = "#222222",
	lengthNews = 0;

	var myCanvasContext;
	
	/**
	 * Removes all child of the element.
	 * @private
	 * @param {Object} elm - The object to be emptied
	 * @return {Object} The emptied element
	 */
	function emptyElement(elm) {
		while (elm.firstChild) {
			elm.removeChild(elm.firstChild);
		}

		return elm;
	}

	/**
	 * Handles the hardware key events.
	 * @private
	 * @param {Object} event - The object contains data of key event
	 */
	function keyEventHandler(event) {
		if (event.keyName === "back") {
			try {
				tizen.application.getCurrentApplication().exit();
			} catch (ignore) {}
		}
	}

	/**
	 * Adds a text node with specific class to an element.
	 * @private
	 * @param {Object} objElm - The target element to be added the text
	 * @param {string} textClass - The class to be applied to the text
	 * @param {string} textContent - The text string to add
	 */
	function addTextElement(objElm, textClass, textContent) {
		var newElm = document.createElement("p");

		newElm.className = textClass;
		newElm.appendChild(document.createTextNode(textContent));
		objElm.appendChild(newElm);
	}

	/**
	 * Cuts the text by length and put ellipsis marks at the end if needed.
	 * @private
	 * @param {string} text - The original string to be cut
	 * @param {number} maxLength - The maximum length of the string
	 */
	function trimText(text, maxLength) {
		var trimmedString;

		if (text.length > maxLength) {
			trimmedString = text.substring(0, maxLength - 3) + "...";
		} else {
			trimmedString = text;
		}

		return trimmedString;
	}

	function drawLine(startx, starty, endx, endy, color) {
		myCanvasContext.beginPath();
		myCanvasContext.strokeStyle=color;
		myCanvasContext.lineWidth=1;
		myCanvasContext.moveTo(startx, starty);
		myCanvasContext.lineTo(endx, endy);
		myCanvasContext.stroke();
	}	

	var animationOffset = 0;
	var maxAnimationOffset = 140;
	function drawHorizontalPowerAnimation(startx, endx, starty, endy, num_dots, dir)
	{
		if (dir === 0) {
			var x = 0;
			while (x < (endx - startx)) {
				if (x === animationOffset || (num_dots > 1 && x === animationOffset - 15) || (num_dots > 2 && x === animationOffset - 30) || (num_dots > 3 && x === animationOffset - 45) ) {
					drawLine(x+startx, starty, x+startx, endy, TFT_WHITE);
					x++;
					if (x < (endx - startx)) {
						drawLine(x+startx, starty, x+startx, endy, TFT_WHITE);
						x++;
					}
					if (x < (endx - startx)) {
						drawLine(x+startx, starty, x+startx, endy, TFT_WHITE);
						x++;
					}
				} else {
					drawLine(x+startx, starty, x+startx, endy, TFT_DARKGREY);
					x++;
				}
			}
		} else {
			var x = (endx - startx);
			while (x > 0) {
				if (x === (maxAnimationOffset-animationOffset) || (num_dots > 1 && x === (maxAnimationOffset-animationOffset) - 15) || (num_dots > 2 && x === (maxAnimationOffset-animationOffset) - 30) || (num_dots > 3 && x === (maxAnimationOffset-animationOffset) - 45)) {
					drawLine(x+startx, starty, x+startx, endy, TFT_WHITE);
					x--;
					if (x > 0) {
						drawLine(x+startx, starty, x+startx, endy, TFT_WHITE);
						x--;
					}
					if (x > 0) {
						drawLine(x+startx, starty, x+startx, endy, TFT_WHITE);
						x--;
					}
				} else {
					drawLine(x+startx, starty, x+startx, endy, TFT_DARKGREY);
					x--;
				}
			}
		}
	}

	function drawVerticalPowerAnimation(startx, endx, starty, endy, num_dots, dir)
	{
		if (dir === 0) {
			var y = 0;
			while (y < (endy - starty)) {
				if (y === animationOffset || (num_dots > 1 && y === animationOffset - 15) || (num_dots > 2 && y === animationOffset - 30) || (num_dots > 3 && y === animationOffset - 45) ) {
					drawLine(startx, y+starty, endx, y+starty, TFT_WHITE);
					y++;
					if (y < (endy - starty)) {
						drawLine(startx, y+starty, endx, y+starty, TFT_WHITE);
						y++;
					}
					if (y < (endy - starty)) {
						drawLine(startx, y+starty, endx, y+starty, TFT_WHITE);
						y++;
					}
				} else {
					drawLine(startx, y+starty, endx, y+starty, TFT_DARKGREY);
					y++;
				}
			}
		} else {
			var y = (endy - starty);
			while (y > 0) {
				if (y === (maxAnimationOffset-animationOffset) || (num_dots > 1 && y === (maxAnimationOffset-animationOffset) - 15) || (num_dots > 2 && y === (maxAnimationOffset-animationOffset) - 30) || (num_dots > 3 && y === (maxAnimationOffset-animationOffset) - 45)) {
					drawLine(startx, y+starty, endx, y+starty, TFT_WHITE);
					y--;
					if (y > 0) {
						drawLine(startx, y+starty, endx, y+starty, TFT_WHITE);
						y--;
					}
					if (y > 0) {
						drawLine(startx, y+starty, endx, y+starty, TFT_WHITE);
						y--;
					}
				} else {
					drawLine(startx, y+starty, endx, y+starty, TFT_DARKGREY);
					y--;
				}
			}
		}
	}


	function advanceAnimation()
	{
		if (arrayData.length < 4) {
			return;
		}
		//Battery usage animation
		var numBattArrows = 0;
		var battDirection = 0;
		var fbattuse = parseFloat(arrayData[4]);
		if (fbattuse < -0.1) {
			if (fbattuse >= -0.7) {
				numBattArrows = 1;
			} else if (fbattuse >= -1.4) {
				numBattArrows = 2;
			} else {
				numBattArrows = 3;
			}
			battDirection = 0;
			drawHorizontalPowerAnimation(70, 156, 175, 183, numBattArrows, battDirection);
		} else if (fbattuse > 0.1) {
			if (fbattuse <= 0.7) {
				numBattArrows = 1;
			} else if (fbattuse <= 1.4) {
				numBattArrows = 2;
			} else {
				numBattArrows = 3;
			}
			battDirection = 1;
			drawHorizontalPowerAnimation(70, 156, 175, 183, numBattArrows, battDirection);
		}

		//Grid usage animation
		var numGridArrows = 0;
		var gridDirection = 0;
		var fgrid = parseFloat(arrayData[3]);
		if (fgrid < -0.1) {
			if (fgrid >= -1.0) {
				numGridArrows = 1;
			} else if (fgrid >= -2.0) {
				numGridArrows = 2;
			} else if (fgrid >= -6.0) {
				numGridArrows = 3;
			} else {
				numGridArrows = 4;
			}
			gridDirection = 0;
			drawHorizontalPowerAnimation(210, 305, 175, 183, numGridArrows, gridDirection);
		} else if (fgrid > 0.1) {
			if (fgrid <= 1.0) {
				numGridArrows = 1;
			} else if (fgrid <= 2.0) {
				numGridArrows = 2;
			} else if (fgrid <= 6.0) {
				numGridArrows = 3;
			} else {
				numGridArrows = 4;
			}
			gridDirection = 1;
			drawHorizontalPowerAnimation(210, 305, 175, 183, numGridArrows, gridDirection);
		}

		//PV usage animation
		var numPVArrows = 0;
		var pvDirection = 0;
		var fpv = parseFloat(arrayData[1]);
		if (fpv < -0.1) {
			if (fpv >= -1.0) {
				numPVArrows = 1;
			} else if (fpv >= -2.0) {
				numPVArrows = 2;
			} else if (fpv >= -6.0) {
				numPVArrows = 3;
			} else {
				numPVArrows = 4;
			}
			pvDirection = 1;
			drawVerticalPowerAnimation(183, 187, 53, 153, numPVArrows, pvDirection);
		} else if (fpv > 0.1) {
			if (fpv <= 1.0) {
				numPVArrows = 1;
			} else if (fpv <= 2.0) {
				numPVArrows = 2;
			} else if (fpv <= 6.0) {
				numPVArrows = 3;
			} else {
				numPVArrows = 4;
			}
			pvDirection = 0;
			drawVerticalPowerAnimation(179, 187, 53, 153, numPVArrows, pvDirection);
		}

		//house consumer usage animation
		var numUseArrows = 0;
		var useDirection = 0;
		var fuse = parseFloat(arrayData[2]);
		if (fuse < -0.1) {
			if (fuse >= -1.0) {
				numUseArrows = 1;
			} else if (fuse >= -2.0) {
				numUseArrows = 2;
			} else if (fuse >= -6.0) {
				numUseArrows = 3;
			} else {
				numUseArrows = 4;
			}
			useDirection = 1;
			drawVerticalPowerAnimation(179, 187, 207, 295, numUseArrows, useDirection);
		} else if (fuse > 0.1) {
			if (fuse <= 1.0) {
				numUseArrows = 1;
			} else if (fuse <= 2.0) {
				numUseArrows = 2;
			} else if (fuse <= 6.0) {
				numUseArrows = 3;
			} else {
				numUseArrows = 4;
			}
			useDirection = 0;
			drawVerticalPowerAnimation(179, 187, 207, 295, numUseArrows, useDirection);
		}

		animationOffset++;
		if (animationOffset > maxAnimationOffset) {
			animationOffset = 0;
		}
	}


	/**
	 * Displays a news and page number of the selected index.
	 * @private
	 */
	function showNews() {
		var soc  = document.querySelector("#soc");
		emptyElement(soc);
		addTextElement(soc, "subject", arrayData[0]+"%");
		var pv  = document.querySelector("#pv");
		emptyElement(pv);
		addTextElement(pv, "subject", arrayData[1]+"kW");
		var use  = document.querySelector("#use");
		emptyElement(use);
		addTextElement(use, "subject", arrayData[2]+"kW");
		var grid  = document.querySelector("#grid");
		emptyElement(grid);
		addTextElement(grid, "subject", arrayData[3]+"kW");
		var battuse  = document.querySelector("#battuse");
		emptyElement(battuse);
		addTextElement(battuse, "subject", arrayData[4]+"kW");
		var battfill  = document.querySelector("#battfill");
		battfill.style.height = Math.round((parseFloat(arrayData[0]) / 100.0) * 70.0) + "px";

		var c = document.getElementById("myCanvas");
		c.setAttribute('width', '360');
		c.setAttribute('height', '360');
		myCanvasContext = c.getContext("2d");
		myCanvasContext.clearRect(0,0,359,359);

	}





	/**
	 * Reads data from internet by XMLHttpRequest, and store received data to the local array.
	 * @private
	 */
	function getDataFromXML() {
		var objNews = document.querySelector("#soc"),
		xmlhttp = new XMLHttpRequest(),
		txtDoc,
		i;

		lengthNews = 0;
		emptyElement(objNews);
		console.log("Getting Data...");

		xmlhttp.open(XML_METHOD, XML_ADDRESS, false);
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				console.log("Fetch result: "+xmlhttp.responseText);
				var result = xmlhttp.responseText.split('\n');
				if (result.length >4) {
					arrayData = result;
					showNews();
				}
				xmlhttp = null;
			} else {
				addTextElement(objNews, "subject", MSG_ERR_NOTCONNECTED);
			}
		};

		xmlhttp.send();
	}


	var dataFetchTimer = false;
	var animationTimer = false;
	
	/**
	 * Initiates the application.
	 * @private
	 */
	function init() {
		document.addEventListener("tizenhwkey", keyEventHandler);
		getDataFromXML();
		dataFetchTimer = setInterval(getDataFromXML, 20000);
		animationTimer = setInterval(advanceAnimation, 20);
		document.addEventListener('visibilitychange', handleVisibilityChange);
	}

	function handleVisibilityChange(){
		if (document.visibilityState === 'hidden') {
			console.log("Page is now hidden.");
			if (dataFetchTimer !== false) {
				clearInterval(dataFetchTimer);
				dataFetchTimer = false;
			}
			if (animationTimer !== false) {
				clearInterval(animationTimer);
				animationTimer = false;
			}
		} else {
			console.log("Page is now visible.");
			getDataFromXML();
			if (dataFetchTimer === false)
				dataFetchTimer = setInterval(getDataFromXML, 20000);
			if (animationTimer === false)
			    animationTimer = setInterval(advanceAnimation, 20);
		}
	}
	
	window.onload = init;
	
}());