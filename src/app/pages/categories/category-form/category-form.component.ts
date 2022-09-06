import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';
import toastr from 'toastr';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  isEditing: boolean;
  categoryForm: FormGroup;
  pageTitle: string = 'Cadastro de Nova Categoria';
  serverErrorMessages: string[] = null;
  submitingForm: boolean = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submitingForm = true;
    if(this.isEditing) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }
  

  // PRIVATE METHODS

  private setPageTitle() {
    if(this.isEditing) {
      const categoryName = this.category.name || ''
      this.pageTitle = 'Editando Categoria: ' + categoryName;
    }
  }

  private setCurrentAction() {
    if(this.route.snapshot.url[0].path == "new") {
      this.isEditing = false;
    } else {
      this.isEditing = true;
    }
  }

  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    });
  }

  private loadCategory() {
    if(this.isEditing) {
      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+params.get("id")))
      ).subscribe(category => {
        this.category = category;
        this.categoryForm.patchValue(this.category);
      },
      (error) => alert('Ocorreu um erro no servidor'))
    }
  }

  private createCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryService.create(category)
      .subscribe(
        category => this.actionsForSuccess(category),
        error => this.actionsForError(error)
      )
  }
  private actionsForError(error: any): void {
    toastr.error('Ocorreu um erro ao processar sua solicitação!');
    this.submitingForm = false;
    if(error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = ['Falha na comunicação com o servidor.']
    }
  }

  private actionsForSuccess(category: Category): void {
    toastr.success('Solicitação processada com sucesso!');
    this.router.navigateByUrl('categories', {skipLocationChange: true}).then(
      () => this.router.navigate(['categories', category.id, 'edit'])
    );
  }

  private updateCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryService.update(category)
      .subscribe(
        category => this.actionsForSuccess(category),
        error => this.actionsForError(error)
      )
  }

}
