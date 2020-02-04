import { AfterViewInit, Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { from, fromEvent, Observable, of } from 'rxjs';
import { map, scan, pluck, mergeMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    @ViewChild('coolButton', {static: true}) coolButton: ElementRef;
    @ViewChild('main', {static: true}) main: ElementRef;
    @ViewChild('toolbar', {static: true}) toolbar: ElementRef;
    @ViewChild('drawingBoard', {static: true}) drawingBoard: ElementRef;

    public clickDetails: any;
    public wasHoldingShift: boolean;

    title = 'RxJSTraining';

    ngOnInit(): void {
        this.registerSubscriptions();
    }

    registerSubscriptions(): void {
        // this.numberProducts();
        this.clickReport();
        this.mouseMovement();

        const buttonClick = fromEvent(this.coolButton.nativeElement, 'click');
        buttonClick
            .subscribe(() => this.randomisePageColour());
    }

    mouseMovement(): void {
        const mouseDown$ = fromEvent(document, 'mousedown');
        const mouseMove$ = fromEvent(document, 'mousemove');
        const mouseUp$ = fromEvent(document, 'mouseup');

        mouseDown$
            .pipe(
                mergeMap(_ => {
                    return mouseMove$.pipe(
                        map((mouseEvent: any) => of({
                            startX: mouseEvent.layerX,
                            startY: mouseEvent.layerY,
                            deltaX: mouseEvent.movementX,
                            deltaY: mouseEvent.movementY
                        })),
                        takeUntil(mouseUp$)
                    );
                }),
                map(move => {
                    if (move.value) {
                        console.log(move.value);
                        this.drawLine(move.value);
                    }
                })
            )
            .subscribe(console.log);
    }

    drawLine(mouseMove: any): void {
        const canvas = document.getElementById('drawingBoard');
        if (canvas.getContext) {
            const context = canvas.getContext('2d');
            context.lineWidth = 1;
            context.strokeStyle = 'red';
            context.beginPath();
            context.moveTo(mouseMove.startX, mouseMove.startY);
            context.lineTo(mouseMove.startX + mouseMove.deltaX/2, mouseMove.startY + mouseMove.deltaY/2);
            context.stroke();
        }
    }

    clearCanvas(): void {
        const canvas = document.getElementById('drawingBoard');
        if (canvas.getContext) {
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    clickReport(): void {
        const genericClick$ = fromEvent(document, 'click');

        genericClick$
            .pipe(map(event => this.clickDetails = {
                x: event.layerX,
                y: event.layerY,
                onCanvas: event.target.id === 'drawingBoard' ? true : false
            }))
            // map(console.log))
            .subscribe();

        genericClick$
            .pipe(pluck('shiftKey'))
            .subscribe(x => this.wasHoldingShift = !!x);
    }

    numberProducts(): void {
        const numberPairs = [
            {x: 3, y: 7},
            {x: 4, y: 11},
            {x: 2, y: -6},
            {x: 0, y: 213},
        ];
        const numberPair$ = from(numberPairs);

        // Implementation 1
        // numberPair$
        //     .pipe(map(pair => ({
        //         ...pair, product: pair.x * pair.y
        //     })))
        //     .pipe(map(item => console.log(item)))
        //     .subscribe();

        // Implementation 2
        // numberPair$
        //     .pipe(
        //         map(pair => ({
        //             ...pair, product: pair.x * pair.y
        //         })),
        //         map(item => console.log(item))
        //     )
        //     .subscribe();

        // Implementation 3
        numberPair$
            .pipe(
                mergeMap((pair: any) => {
                    const calc = of({
                        x: pair.x,
                        y: pair.y,
                        product: pair.x * pair.y
                    });
                    console.log(calc.value);
                    return calc;
                })
            )
            .subscribe();
    }

    randomisePageColour(): void {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        console.log(`setting background colour to #${randomColor}`);
        this.main.nativeElement.setAttribute('style', `background-color: #${randomColor}`);
    }
}
