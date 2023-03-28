import { AfterContentChecked, Component, Injector, OnInit, Directive } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import toastr from 'toastr';
import { BaseResourceModel } from '../models/base-resource.model';
import { BaseResourceService } from '../services/base-resource.service';

@Directive()
export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  isEditing: boolean;
  resourceForm: UntypedFormGroup;
  pageTitle: string;
  submittingForm: boolean = false;
  serverErrorMessages: string[] = null;

  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: UntypedFormBuilder;

  constructor(
    protected injector: Injector,
    public resource: T,
    protected baseService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T
  ) { 
    this.route = injector.get(ActivatedRoute);
    this.router = injector.get(Router);
    this.formBuilder = injector.get(UntypedFormBuilder);
  }


  ngOnInit() {
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if(this.isEditing) {
      this.updateResource();
    } else {
      this.createResource();
    }
  }

  updateResource() {
    const resourse: T = this.jsonDataToResourceFn(this.resourceForm.value);
    this.baseService.update(resourse)
    .subscribe(
      resourse => this.actionsForSuccess(resourse),
      error => this.actionsForError(error)
    )
  }

  createResource(): void {
    const resourse: T = this.jsonDataToResourceFn(this.resourceForm.value);
    this.baseService.create(resourse)
      .subscribe(
        resourse => this.actionsForSuccess(resourse),
        error => this.actionsForError(error)
      )
  }

  private actionsForError(error: any): void {
    toastr.error('Ocorreu um erro ao processar sua solicitação!');
    this.submittingForm = false;
    if(error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = ['Falha na comunicação com o servidor.']
    }
  }

  private actionsForSuccess(resource: T): void {    
    toastr.success('Solicitação processada com sucesso!');    
    
    const baseComponentPath: string = this.route.snapshot.parent.url[0].path;

    this.router.navigateByUrl(baseComponentPath, {skipLocationChange: true, replaceUrl: true}).then(
      () => this.router.navigate([baseComponentPath, resource.id, 'edit'])
    );
  }


  protected setCurrentAction() {
    if(this.route.snapshot.url[0].path == 'new') {
      this.isEditing = false;
    } else {
      this.isEditing = true;
    }    
  }

  protected abstract buildResourceForm(): void;

  protected loadResource() {
    if(this.isEditing) {
      const resourceId = +this.route.snapshot.paramMap.get('id');
      this.baseService.getById(resourceId).subscribe(
        (resource) => {
          this.resource = resource;
          this.resourceForm.patchValue(resource);          
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde.'));
    }
  }

  protected setPageTitle() {
    if(this.isEditing) {    
      this.pageTitle = this.creationPageTitle();
    } else {
      this.pageTitle = this.editionPageTitle();
    }
  }

  protected editionPageTitle(): string {
    return 'Novo';
  }

  protected creationPageTitle(): string {
    return 'Edição';
  }

}
