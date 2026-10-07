import type { Day, Module } from '../types';

const day = (id: string, title: string, leg: string, hours: number, at: [number,number], photos: string[], weather: string, bed: string, hi: string[], extra: Partial<Day> = {}): Day => ({
  id, title, leg, hours, at, photos, kind:'drive', act:'U', rental:'Salt Lake car', required:true,
  routeId:id, poiDay:id, weather:{day:weather,bed,car:bed},
  sleep:{t:'motel',where:bed === 'moab' ? 'Moab · compare an inn with a confirmed campground' : bed === 'vernal' ? 'Vernal · hotel or permitted campground' : 'Salt Lake City · hotel with parking'},
  hi, food:[{nm:'Groceries and a packed lunch',note:'Restock before the park; choose dinner in the overnight town.',tags:[]}],
  why:'A flexible Utah finish, with the final night back in Salt Lake City.', ...extra
});
export const UTAH_FINALE: Module = {
  id:'utahFinale', name:'Utah finale · Quarry, Arches & Canyonlands', replaces:['s8','depart'],
  conflicts:['oysters','craters','montanaRain'], cost:'same return date', risk:'lo',
  desc:'Replace the California finish with Dinosaur National Monument and Moab. Return to Salt Lake City the day before flying home via Seattle and Frankfurt.',
  days:[
    day('utSouth','South to Salt Lake · potatoes on the way','Bozeman → West Yellowstone → Idaho Falls → Blackfoot → Salt Lake City',7,[40.76,-111.89],['idahofalls','gallatincanyon'],'idahofalls','saltlake',[
      'Leave Bozeman in the morning. This is a full transfer day: allow roughly 7 hours at the wheel, plus charging, food and the museum.',
      'Idaho Potato Museum in Blackfoot: October hours Monday–Saturday 10:00–16:00. Aim for 13:00–14:00 and allow 45–60 minutes.',
      'Continue to Salt Lake City for the night. If leaving late or tired, stop around Idaho Falls and shorten the following day rather than driving exhausted.'
    ],{charge:['Use Tesla navigation for West Yellowstone, Idaho Falls and I-15 charging stops; check live availability and the predicted arrival reserve.'],alert:'Confirm the Tesla rental extension through October 13, including mileage allowance. Check US-191, US-20 and I-15 before departure.'}),
    day('utQuarry','Quarry Exhibit Hall · the wall of dinosaur bones','Salt Lake City → Heber City → Vernal → Quarry Exhibit Hall → Vernal',4.5,[40.4406,-109.3012],['dinosaurquarry','vernal'],'vernal','vernal',[
      'Leave Salt Lake City around 08:30–09:00 via US-40. Charge in Vernal before the local park loop if needed.',
      'Aim for Quarry Exhibit Hall around 13:00–14:00. Allow 1½–2 hours for the fossil wall and visitor center. Fall opening hours are 09:00–17:00; in October visitors drive their own vehicles to the hall.',
      'Navigate to the Utah entrance near Jensen, not the Colorado Canyon Visitor Center. Around 1,500 dinosaur bones remain embedded in the rock inside the building.',
      'If the weather and time allow, add a short look at the Split Mountain / Green River area. Sleep in Vernal.'
    ],{charge:['Vernal Supercharger: use the native Tesla connector. Confirm availability in the car and charge for the next transfer.'],alert:'Check current Dinosaur National Monument alerts and Quarry hours before setting off: nps.gov/dino/planyourvisit/basicinfo.htm. The hall is indoors; outdoor extensions depend on weather.'}),
    day('utMoab','To Moab · a first afternoon in Arches','Vernal → Duchesne → Price → Green River → Moab → Arches → Moab',6,[38.688,-109.537],['arches','windows'],'moab','moab',[
      'Start early, around 07:30. Use US-40, US-191, US-6 and I-70 via Price and Green River; allow 5–6 hours including local park driving, plus charging and food.',
      'After settling into Moab, use the afternoon for The Windows, Double Arch and Balanced Rock if there is daylight and dry footing.',
      'Keep Delicate Arch for tomorrow if the transfer runs long. There is no need to fit a full national-park day after the drive.'
    ],{charge:['Navigate between confirmed Tesla Superchargers in Vernal, Price / Green River and Moab. Top up before the park; do not count on charging inside Arches.'],alert:'The US-191 crossing between Duchesne and Price is a mountain road. Check Utah 511 for snow, visibility and closures; use the signed open paved alternative if needed.'}),
    day('utArches','Arches · sandstone windows and Delicate Arch','Moab → Arches National Park → Moab',2,[38.7436,-109.4993],['arches','windows'],'moab','moab',[
      'Use the driest part of the day for Delicate Arch: about 4.8 km return and 146 m ascent. Take water and allow 2–3 hours.',
      'Add The Windows / Double Arch if not visited yesterday; Landscape Arch is another option if time, weather and energy allow.',
      'If showers or thunderstorms make exposed rock unsuitable, use short roadside stops or swap this day with Canyonlands. Recheck the hourly forecast in the morning.'
    ],{charge:['Charge in Moab for the entire Arches loop and overnight use. Keep a reserve; no adapter or in-park charging is assumed.'],alert:'Arches does not require timed-entry reservations in 2026. Entrance passes still apply, parking can fill, and Fiery Furnace permits / campsite reservations are separate.'}),
    day('utCanyon','Canyonlands & Dead Horse Point · weather-flex day','Moab → Island in the Sky → Dead Horse Point → Moab',3,[38.383,-109.868],['canyonlands','deadhorse'],'canyonlands','moab',[
      'Island in the Sky: choose Mesa Arch, Grand View Point and Green River Overlook according to visibility and dry footing.',
      'Add Dead Horse Point if conditions are good; its state-park entrance fee is separate from the national-parks pass.',
      'Stay on paved access roads. Skip Shafer Trail, White Rim Road and other unpaved routes in the rental.',
      'This is the weather buffer. If rain is persistent, shorten the sightseeing and return toward Salt Lake City early. Do not force a hike in thunderstorms.'
    ],{charge:['Start charged in Moab for the full Canyonlands / Dead Horse Point loop and return. There is no assumed park charging.'],alert:'The outlook checked October 7 shows showers from October 10 onward. Swap the two park days around the latest forecast; never enter flooded washes or closed roads.'}),
    day('utReturn','Back to Salt Lake · Red Butte Garden','Moab → Green River → Price → Salt Lake City → Red Butte Garden',4.5,[40.765,-111.823],['saltlakecity','greatsaltlake'],'saltlake','saltlake',[
      'Leave Moab around 08:00–08:30. Allow 4–4½ hours driving plus charging and a meal; aim to be in Salt Lake City by early afternoon.',
      'Red Butte Garden is the priority in dry weather: October hours 09:00–17:00. Allow about two hours, ideally 14:00–16:00.',
      'If it rains, choose the adjacent Natural History Museum of Utah instead. Prehistoric Museum in Price is an alternative on the drive, not an extra stop to squeeze in before the garden.',
      'Sleep in Salt Lake City. Pack, confirm tomorrow’s handover and charge requirement, and keep the evening easy.'
    ],{charge:['Charge en route as directed by the car. Arrange the final charging stop around the host’s required return level, leaving time for the airport transfer.']}),
    day('utFly','Fly home from Salt Lake City','SLC 15:02 → Seattle 16:17 / 18:05 → Frankfurt 13:10 (+1) / 15:00 → Prague 16:00 (+1)',0,[40.7899,-111.9791],['saltlakecity'],'saltlake','saltlake',[
      'Return the Tesla with the agreed charge and photograph the handover. Aim to be at the SLC terminal around 12:00; allow additional time for the rental return and transfer.',
      'Alaska AS734: Salt Lake City 15:02 → Seattle 16:17. Seattle connection: 1 hour 48 minutes.',
      'Condor DE2033: Seattle 18:05 → Frankfurt 13:10 on October 14. Frankfurt connection: 1 hour 50 minutes.',
      'Condor DE4407: Frankfurt 15:00 → Prague 16:00 on October 14. All times are local.',
      'The supplied itinerary lists one checked bag per person. Confirm baggage tagging through to Prague at check-in; seats and meals are not selected in the itinerary.'
    ],{kind:'depart',sleep:undefined,routeId:'utAirport',charge:['Complete the final charging stop before returning the Tesla; check the agreed return charge with the host.'],why:'The road trip ends in Salt Lake City, with the night before departure already in town.'})
  ]
};
