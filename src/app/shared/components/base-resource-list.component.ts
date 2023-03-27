import { BaseResourceModel } from '../models/base-resource.model';
import { BaseResourceService } from '../services/base-resource.service';

export abstract class BaseResourceListComponent<T extends BaseResourceModel> {

  resources: T[] = [];

  constructor(protected service: BaseResourceService<T>) { }

  ngOnInit() {
    this.getAll();
  }

  private getAll() {
    this.service.getAll().subscribe(
      resources => this.resources = resources,
      error => alert('Erro ao carregar lista')
    );
  }

  protected delete(resource: T) {
    const mustDelete = confirm('Deseja realmente excluir este item?');
    if(mustDelete) {
      this.service.delete(resource.id).subscribe(
        () => this.resources = this.resources.filter(element => element != resource),
        () => alert('Erro ao excluir!')
      )
    }
  }

}
