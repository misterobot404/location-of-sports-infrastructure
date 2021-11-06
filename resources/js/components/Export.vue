<template>
    <v-dialog v-model="m_show" width="400px">
        <v-card class="pa-4 d-flex flex-column">
            <h3 class="align-self-center mt-1">Варианты выгрузки:</h3>
            <!--  Варианты выгрузки -->
            <v-btn class="mt-4" @click="exportToPDF()">
                <v-icon class="mr-1" color="primary">picture_as_pdf</v-icon>
                PDF
            </v-btn>
            <v-btn class="mt-2" @click="exportToExcel()">
                <v-icon class="mr-1" color="primary">grid_on</v-icon>
                Excel
            </v-btn>
            <!--  Actions  -->
            <v-btn @click="$emit('close')" color="primary" class="mt-4 align-self-center">Закрыть</v-btn>
        </v-card>
    </v-dialog>

</template>

<script>
export default {
    name: "Export",
    props: [
        'show',
        'currentRegionInfo',
        'choosedIntersections'
    ],
    computed: {
        m_show: {
            get() {
                return this.show
            },
            set(v) {
                if (!v) this.$emit('close');
            }
        }
    },
    methods: {
        agregateExportHTML() { //формирует html для экспорта
            let _html = '';
            //выбранный регион
            _html += '<h2>Выбранный регион</h2>';
            _html += this.currentRegionInfo;
            //выбранные пересечения
            this.choosedIntersections.forEach(intersect => {
                _html += '<h2>Пересечение</h2>';
                _html += intersect.properties.get('customHTML');
            });
            return _html;
        },
        exportToExcel() {
            var uri = 'data:application/vnd.ms-excel;base64,'
                ,
                template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
                , base64 = function (s) {
                    return window.btoa(unescape(encodeURIComponent(s)))
                }
                , format = function (s, c) {
                    return s.replace(/{(\w+)}/g, function (m, p) {
                        return c[p];
                    })
                }
            var ctx = {worksheet: name || 'Worksheet', table: this.agregateExportHTML()}
            window.location.href = uri + base64(format(template, ctx))
        },
        exportToPDF() {
            let _html = this.agregateExportHTML();
            html2pdf(_html);
        },
    },
}
</script>

<style scoped>

</style>
