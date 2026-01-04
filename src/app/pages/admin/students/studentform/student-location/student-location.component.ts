import { Component, effect, EventEmitter, input, OnChanges, Output, SimpleChanges, untracked } from '@angular/core';
import { LatLngExpression, Map, Marker, icon, marker, tileLayer } from 'leaflet';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'busnaa-student-location',
  templateUrl: './student-location.component.html',
  styleUrls: ['./student-location.component.scss'],
  standalone:true,
  imports:[LeafletModule]
})
export class StudentLocationComponent {
  location=input('');
  @Output()newlocation:EventEmitter<string>=new EventEmitter()
  marker!:Marker;
  map!:Map;
  options = {
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        })
      ],
      center:environment.fixedLocation as LatLngExpression,
      zoom: 10
    };
  constructor() {

    effect(() => {
      const loc=this.location();
      untracked(()=>{
        if(loc&& this.map){
          this.setlocation()
        }
      })
    })
   }
  latlng():LatLngExpression{
    let markerloc=this.location().split(",")
    return [+markerloc[0],+markerloc[1]]
  }
  onMapReady(map:Map){   
    this.map=map;
    this.setlocation()
  }
  setlocation(){
      if(this.marker){
        this.marker.setLatLng(this.latlng())
        this.map.panTo(this.latlng())
      }
    else{
      this.marker=marker(this.location()?this.latlng():environment.fixedLocation,{draggable:true,icon:icon({
        iconUrl:'images/marker_start.svg',
        iconSize:[30,30],
        iconAnchor:[15,30]
      })}).on('dragend',(e)=>{
        this.newlocation.emit(`${e.target._latlng.lat},${e.target._latlng.lng}`)
      }).addTo(this.map)
    }      
    
  }
}
