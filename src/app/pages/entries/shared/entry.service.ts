import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, flatMap } from 'rxjs/operators';
import { BaseResourceService } from 'src/app/shared/services/base-resource.service';
import { CategoryService } from '../../categories/shared/category.service';
import { Entry } from './entry.model';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry> {

  constructor(
    private categoryService: CategoryService,
    protected injector: Injector
  ) {
    super('api/entries', injector, Entry.fromJson);
  }

  getByMonthAndYear(month: number, year: number) {
    return this.getAll().pipe(
      map(entries => this.filterByMonthAndYear(entries, month, year))
    )
  }

  create(entry: Entry): Observable<Entry> {
    return this.prepareCategory(entry, super.create.bind(this)); 
  }
  
  update(entry: Entry): Observable<Entry> {
    const url = `${this.apiPath}/${entry.id}`;
    return this.prepareCategory(entry, super.update.bind(this));
  }
  
  private prepareCategory(entry: Entry, sendFn: any): Observable<Entry> {
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category;
        return sendFn(entry);
      })
    );
  }

  private filterByMonthAndYear(entries: Entry[], month: number, year: number) {    
    return entries.filter(entry => {
      const entryDate = moment(entry.date, 'DD/MM/YYYY');     
      const monthMatches = entryDate.month() + 1 == month;
      const yearMatches = entryDate.year() == year;          
      if(monthMatches && yearMatches) {   
        return entry;
      }
    })
  }
}
