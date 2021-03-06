<template>
  <div class="btn-group col-auto">
    <button type="button" class="btn btn-info" @click="onDownloadCSV">
      下載 CSV
    </button>

    <button type="button" class="btn btn-warning" @click="onDownloadJSON">
      下載 JSON
    </button>
  </div>
</template>

<script>
import Papa from 'papaparse'
import combination from '@/data/combination'
import _ from 'lodash'
import { createDownloadFile, downloadJSON } from '@/components/helpers'

export default {
  props: ['list', 'filename', 'role'],
  computed: {
    removePrioritiesAndRankList () {
      const { list } = this
      return _.map(list, e => _.omit(e, 'priorities', 'rank'))
    }
  },
  methods: {
    onDownloadJSON () {
      const { list, role, removePrioritiesAndRankList, filename } = this
      switch (role) {
        case 'TEACHER':
          downloadJSON(removePrioritiesAndRankList, filename, 'json')
          break
        case 'ADMIN':
          downloadJSON(list, filename, 'json')
          break
        default:
          downloadJSON([], filename, 'json')
      }
    },
    createCSVData (list) {
      const deepCloneData = _.cloneDeep(list)
      const csvJSON = _(deepCloneData)
        .map(student => {
          student.timestamp = student.timestamp.Time
          return _(combination)
            .map(comb => {
              comb.priorities = student.priorities.indexOf(comb.id)
              return comb
            })
            .keyBy(obj => obj.subjects.join('+'))
            .mapValues('priorities')
            .assign(student)
            .omit('priorities')
            .value()
        })
        .value()
      return csvJSON
    },
    onDownloadCSV () {
      const {
        role,
        createCSVData,
        list,
        removePrioritiesAndRankList,
        filename
      } = this
      let csv
      // create headers fields
      const fields = _(list[0])
        .keys()
        .pull('priorities')
        .value()
      switch (role) {
        case 'TEACHER':
          csv = Papa.unparse({
            data: removePrioritiesAndRankList
          })
          break
        case 'ADMIN':
          combination.forEach(comb => {
            fields.push(comb.subjects.join('+'))
          })
          csv = Papa.unparse({
            data: createCSVData(list),
            fields
          })
          break
        default:
          csv = ''
          break
      }
      createDownloadFile(csv, filename, 'csv')
    }
  }
}
</script>
