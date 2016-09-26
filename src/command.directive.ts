import {
	Directive,
	OnInit,
	OnDestroy,
	Input,
	HostBinding,
	HostListener,
	Renderer,
	ElementRef,
	Inject
} from "@angular/core";
import { Subscription } from "rxjs/Subscription";

import { CommandOptions, COMMAND_CONFIG } from "./config";
import { ICommand } from "./command";

/**
 *
 * ### Example with options
 * ```html
 * <button [command]="saveCmd" [commandOptions]="{executingCssClass: 'in-progress'}">Save</button>
 * ```
 * @export
 * @class CommandDirective
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Directive({
	selector: "[command]",
})
export class CommandDirective implements OnInit, OnDestroy {

	@Input() command: ICommand;
	@Input() commandOptions: CommandOptions;
	@HostBinding("disabled") isDisabled: boolean;

	private canExecute$$: Subscription;
	private isExecuting$$: Subscription;

	constructor(
		@Inject(COMMAND_CONFIG) private config: CommandOptions,
		private renderer: Renderer,
		private element: ElementRef
	) {

	}

	ngOnInit() {
		// console.log("[commandDirective::init]");
		this.commandOptions = Object.assign({}, this.config, this.commandOptions);

		if (!this.command) {
			throw new Error("[commandDirective] command should be defined!");
		}

		this.canExecute$$ = this.command.canExecute$
			.do(x => {
				// console.log("[commandDirective::canExecute$]", x);
				this.isDisabled = !x;
			}).subscribe();
		this.isExecuting$$ = this.command.isExecuting$
			.do(x => {
				// console.log("[commandDirective::isExecuting$]", x);
				this.renderer.setElementClass(this.element.nativeElement, this.commandOptions.executingCssClass, x);
			}).subscribe();
	}

	@HostListener("click")
	onClick() {
		// console.log("[commandDirective::onClick]");
		this.command.execute();
	}

	ngOnDestroy() {
		// console.log("[commandDirective::destroy]");
		this.command.destroy();
		this.canExecute$$.unsubscribe();
		this.isExecuting$$.unsubscribe();
	}
}