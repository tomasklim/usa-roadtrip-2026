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
    day('utSouth','Bozeman western shopping → Idaho Falls','Downtown Bozeman → TJ Maxx → West Yellowstone → Idaho Falls',4,[43.49,-112.03],['gallatincanyon','idahofalls'],'bozeman','idahofalls',[
      'Check out at 11:00. Walk Main Street and browse western shops until roughly 12:30: Head West at 24 W Main Street has cowboy hats, boots and vintage western wear downstairs. Wednesday hours are 10:00–18:00.',
      'Have lunch, then allow around 45–60 minutes at TJ Maxx, 1540 N 19th Avenue (09:30–21:30). Aim to leave Bozeman around 14:00–14:30.',
      'Drive south through Gallatin Canyon and West Yellowstone to Idaho Falls. Allow roughly 4 hours driving including local errands, plus charging and breaks; an arrival around 18:30–19:30 is a planning estimate.',
      'Sleep in Idaho Falls. If there is daylight and energy, take a short walk by the river and falls. The Potato Museum waits until tomorrow morning; do not rush to its 16:00 closing.',
      'Today advances the southbound transfer. No repeat Museum of the Rockies visit or Chico stop is planned.'
    ],{sleep:{t:'motel',where:'Idaho Falls · hotel with parking or a confirmed permitted overnight spot'},food:[{nm:'Lunch in downtown Bozeman',note:'Eat before leaving town; keep dinner simple in Idaho Falls.',tags:[]}],charge:['Check the battery before shopping. Use Tesla navigation for charging in Bozeman, West Yellowstone and Idaho Falls as needed; check live availability and the predicted arrival reserve.'],alert:'Confirm the Tesla rental extension through October 13, including mileage allowance. Check US-191 and US-20 before departure. Keep the overnight in Idaho Falls rather than adding a late drive to Salt Lake City.'}),
    day('utMoab','Potato Museum, then south to Moab','Idaho Falls → Blackfoot → Salt Lake City → Price → Green River → Moab',7.5,[38.573,-109.55],['idahofalls','arches'],'idahofalls','moab',[
      'Leave Idaho Falls around 09:15 for Blackfoot. Visit the Idaho Potato Museum when it opens at 10:00; allow 45–60 minutes. October hours are Monday–Saturday 10:00–16:00.',
      'Continue via I-15, Salt Lake City, US-6, Price and Green River to Moab. This is a long transfer: roughly 7–7½ hours driving across the whole day, plus the museum, food and charging. Expect an evening arrival around 20:00–21:00, depending on stops.',
      'Keep Salt Lake City to a meal or charging break. Red Butte Garden is now an optional October 12 stop, not another visit to fit into this transfer.',
      'If the museum is less important than a shorter day, leave Idaho Falls earlier and drive straight south. If tired or delayed, stop in Price or Green River and accept a later start in Arches tomorrow. No park sightseeing is planned tonight.'
    ],{food:[{nm:'Road lunch and an easy Moab dinner',note:'Use a charging break for food and carry snacks; avoid adding a restaurant detour to the long transfer.',tags:[]}],charge:['Use native Tesla Superchargers along I-15, then Price / Green River and Moab as directed by the car. Allow charging time in addition to the driving estimate; arrive ready for tomorrow’s park loop.'],alert:'Check I-15 and US-6 over Soldier Summit. The museum is optional if it makes the transfer too late. Keep the evening free and shorten the drive if tired.'}),
    day('utArches','Arches · sandstone windows and Delicate Arch','Moab → Arches National Park → Moab',2,[38.7436,-109.4993],['arches','windows'],'moab','moab',[
      'Use the driest part of the day for Delicate Arch: about 4.8 km return and 146 m ascent. Take water and allow 2–3 hours.',
      'Add The Windows and Double Arch; Landscape Arch is another option if time, weather and energy allow.',
      'If showers or thunderstorms make exposed rock unsuitable, use short roadside stops or swap this day with Canyonlands. Recheck the hourly forecast in the morning.'
    ],{charge:['Charge in Moab for the entire Arches loop and overnight use. Keep a reserve; no adapter or in-park charging is assumed.'],alert:'Arches does not require timed-entry reservations in 2026. Entrance passes still apply, parking can fill, and Fiery Furnace permits / campsite reservations are separate.'}),
    day('utCanyon','Canyonlands & Dead Horse Point · weather-flex day','Moab → Island in the Sky → Dead Horse Point → Moab',3,[38.383,-109.868],['canyonlands','deadhorse'],'canyonlands','moab',[
      'Island in the Sky: choose Mesa Arch, Grand View Point and Green River Overlook according to visibility and dry footing.',
      'Add Dead Horse Point if conditions are good; its state-park entrance fee is separate from the national-parks pass.',
      'Stay on paved access roads. Skip Shafer Trail, White Rim Road and other unpaved routes in the rental.',
      'This is the weather buffer. If rain is persistent, shorten the sightseeing and return toward Salt Lake City early. Do not force a hike in thunderstorms.'
    ],{charge:['Start charged in Moab for the full Canyonlands / Dead Horse Point loop and return. There is no assumed park charging.'],alert:'The outlook checked October 7 shows showers from October 10 onward. Swap the two park days around the latest forecast; never enter flooded washes or closed roads.'}),
    day('utQuarry','Quarry Exhibit Hall · the wall of dinosaur bones','Moab → Green River → Price → Duchesne → Vernal → Quarry Exhibit Hall → Vernal',5.5,[40.4406,-109.3012],['dinosaurquarry','vernal'],'vernal','vernal',[
      'Leave Moab around 07:30–08:00. Allow about 5½ hours at the wheel plus charging and food, via Green River, Price, Duchesne and Vernal.',
      'Aim for Quarry Exhibit Hall around 14:00–15:00. Allow 1½–2 hours inside. Fall hours are 09:00–17:00; in October visitors drive their own vehicles to the hall. This is the indoor highlight saved for the wetter part of the trip.',
      'Navigate to the Utah entrance near Jensen, not the Colorado Canyon Visitor Center. Around 1,500 dinosaur bones remain embedded in the rock inside the building.',
      'If rain, charging or road conditions delay arrival, move Quarry to tomorrow at 09:00. Sleep in Vernal tonight; do not rush the mountain transfer to beat closing time.'
    ],{charge:['Vernal Supercharger: use the native Tesla connector. Confirm availability in the car and charge for the next transfer.'],alert:'Check Utah 511 for US-191 between Price and Duchesne before departure; this is a mountain crossing. Quarry is indoors, but the drive still depends on conditions. If arrival would be after 15:30, visit at 09:00 tomorrow instead. NPS hours: nps.gov/dino/planyourvisit/basicinfo.htm.'}),
    day('utReturn','Back to Salt Lake · Quarry backup morning','Vernal → Duchesne → Heber City → Salt Lake City',3.5,[40.76,-111.89],['saltlakecity','greatsaltlake'],'saltlake','saltlake',[
      'If Quarry was delayed yesterday, visit at 09:00 today, allow 1½–2 hours and leave toward Salt Lake by 11:00–11:30. Otherwise enjoy an easy morning in Vernal.',
      'Take US-40 via Duchesne and Heber City back to Salt Lake City. Allow roughly 3½ hours driving plus charging and food; aim to arrive during the afternoon.',
      'If Quarry was done yesterday and you arrive early, Natural History Museum of Utah is an optional indoor stop. Red Butte Garden is an alternative if the weather improves and you can arrive by about 15:00 (October hours 09:00–17:00). Choose one; if Quarry is still needed this morning, skip the extra Salt Lake attraction rather than rushing.',
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
